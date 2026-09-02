<?php

namespace App\Http\Controllers\Api\Admin;

use App\Events\LeadAssigned;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminLeadController extends Controller
{
    /**
     * Display listing of all leads across system.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Lead::with(['user:id,name', 'assignedTo:id,name']);

        // Website vs Internal Lead filter
        if ($origin = $request->query('origin')) {
            if ($origin === 'website') {
                $query->where(function ($q) {
                    $q->where('source', 'website')
                      ->orWhere('source', '🌐 Website');
                });
            } elseif ($origin === 'internal') {
                $query->where('source', '!=', 'website')
                      ->where('source', '!=', '🌐 Website');
            }
        }

        // Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($source = $request->query('source')) {
            $query->where('source', $source);
        }

        if ($repId = $request->query('sales_rep_id')) {
            if ($repId === 'unassigned') {
                $query->whereNull('assigned_to');
            } else {
                $query->where('assigned_to', $repId);
            }
        }

        if ($temp = $request->query('temperature')) {
            $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);
            $warmThreshold = 50;

            if ($temp === 'HOT') {
                $query->where('score', '>=', $hotThreshold);
            } elseif ($temp === 'WARM') {
                $query->where('score', '>=', $warmThreshold)->where('score', '<', $hotThreshold);
            } elseif ($temp === 'COLD') {
                $query->where('score', '<', $warmThreshold);
            }
        }

        $sort = $request->query('sort', 'created_at');
        $direction = strtolower($request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $perPage = min((int) $request->query('per_page', 20), 100);
        $leads = $query->paginate($perPage);

        // Stats summary for website leads vs total
        $totalWebsiteLeads = Lead::whereIn('source', ['website', '🌐 Website'])->count();
        $websiteConverted = Lead::whereIn('source', ['website', '🌐 Website'])->whereIn('status', ['won', 'converted'])->count();
        $websiteConversionRate = $totalWebsiteLeads > 0 ? round(($websiteConverted / $totalWebsiteLeads) * 100, 1) : 0;
        $websiteRevenue = (float) Lead::whereIn('source', ['website', '🌐 Website'])->whereIn('status', ['won', 'converted'])->sum('estimated_value');

        return response()->json([
            'success' => true,
            'data' => $leads->items(),
            'pagination' => [
                'current_page' => $leads->currentPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
                'last_page' => $leads->lastPage(),
            ],
            'website_metrics' => [
                'total_website_leads' => $totalWebsiteLeads,
                'website_conversion_rate' => $websiteConversionRate,
                'website_revenue' => $websiteRevenue,
            ],
        ]);
    }

    /**
     * Assign or reassign lead to a Sales Representative.
     */
    public function assign(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $lead = Lead::findOrFail($id);
        $lead->assigned_to = $request->assigned_to;
        $lead->save();

        if ($request->assigned_to) {
            $salesRep = User::find($request->assigned_to);
            if ($salesRep) {
                event(new LeadAssigned($lead, $salesRep));
            }
        }

        AuditLog::log(
            $request->user()->id,
            'lead_assigned',
            'Lead',
            (string) $lead->id,
            ['assigned_to' => $request->assigned_to],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Lead assigned successfully.',
            'data' => $lead->load('assignedTo:id,name'),
        ]);
    }

    /**
     * Delete lead.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $leadId = $lead->id;
        $lead->delete();

        AuditLog::log(
            $request->user()->id,
            'lead_deleted',
            'Lead',
            (string) $leadId,
            [],
            $request->ip()
        );

        return response()->json([
            'success' => true,
            'message' => 'Lead deleted successfully.',
        ]);
    }

    /**
     * Export leads to CSV stream.
     */
    public function export(Request $request): StreamedResponse
    {
        $leads = Lead::with('assignedTo:id,name')->orderBy('created_at', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="crm_leads_export_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($leads) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'First Name', 'Last Name', 'Email', 'Company', 'Source', 'Status', 'Score', 'Estimated Value', 'Assigned To', 'Created Date']);

            foreach ($leads as $lead) {
                fputcsv($file, [
                    $lead->id,
                    $lead->first_name,
                    $lead->last_name,
                    $lead->email,
                    $lead->company,
                    $lead->source,
                    $lead->status,
                    $lead->score ?? 0,
                    $lead->estimated_value ?? 0,
                    $lead->assignedTo ? $lead->assignedTo->name : 'Unassigned',
                    $lead->created_at ? $lead->created_at->toDateTimeString() : '',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

