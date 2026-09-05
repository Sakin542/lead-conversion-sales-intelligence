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
        $this->ensurePipelineDataExists();

        $query = Lead::with(['user:id,name', 'assignedTo:id,name', 'assignedToUser:id,name']);

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

    /**
     * Ensure baseline demo team and multi-stage leads exist if empty.
     */
    private function ensurePipelineDataExists(): void
    {
        if (Lead::count() < 14) {
            // Ensure sales reps exist
            $salesRep = User::firstOrCreate(
                ['email' => 'sales@crm.com'],
                [
                    'name' => 'Sales Representative',
                    'password' => 'Password123!',
                    'role' => User::ROLE_SALES_REP,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            $manager = User::firstOrCreate(
                ['email' => 'manager@crm.com'],
                [
                    'name' => 'Sales Manager',
                    'password' => 'Password123!',
                    'role' => User::ROLE_SALES_MANAGER,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            $alex = User::firstOrCreate(
                ['email' => 'alex.morgan@crm.com'],
                [
                    'name' => 'Alex Morgan',
                    'password' => 'Password123!',
                    'role' => User::ROLE_SALES_REP,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            $repId = $salesRep->id;
            $mgrId = $manager->id;
            $alexId = $alex->id;

            $initialLeads = [
                ['first_name' => 'Emma', 'last_name' => 'Watson', 'email' => 'emma.w@globaltech.com', 'company' => 'Global Tech Corp', 'source' => 'Website', 'status' => 'won', 'score' => 94, 'estimated_value' => 28000, 'assigned_to' => $mgrId],
                ['first_name' => 'Liam', 'last_name' => 'Neeson', 'email' => 'liam.n@apexfin.com', 'company' => 'Apex Financials', 'source' => 'Lead Add Form', 'status' => 'won', 'score' => 91, 'estimated_value' => 35000, 'assigned_to' => $repId],
                ['first_name' => 'Chloe', 'last_name' => 'Davis', 'email' => 'chloe.d@quantum.com', 'company' => 'Quantum Dynamics', 'source' => 'Reference', 'status' => 'won', 'score' => 92, 'estimated_value' => 22000, 'assigned_to' => $alexId],
                
                ['first_name' => 'Sophia', 'last_name' => 'Taylor', 'email' => 'sophia.t@nextwave.io', 'company' => 'NextWave Software', 'source' => 'Reference', 'status' => 'negotiation', 'score' => 88, 'estimated_value' => 24000, 'assigned_to' => $alexId],
                ['first_name' => 'Daniel', 'last_name' => 'Craig', 'email' => 'daniel.c@skyline.com', 'company' => 'Skyline Global', 'source' => 'Website', 'status' => 'negotiation', 'score' => 93, 'estimated_value' => 45000, 'assigned_to' => $mgrId],
                
                ['first_name' => 'David', 'last_name' => 'Miller', 'email' => 'david.m@cloudsys.net', 'company' => 'Cloud Systems Inc', 'source' => 'Website', 'status' => 'proposal', 'score' => 85, 'estimated_value' => 19500, 'assigned_to' => $mgrId],
                ['first_name' => 'Benjamin', 'last_name' => 'Cole', 'email' => 'benjamin.c@novaenergy.org', 'company' => 'Nova Energy Solutions', 'source' => 'Organic Search', 'status' => 'proposal', 'score' => 89, 'estimated_value' => 31000, 'assigned_to' => $repId],
                
                ['first_name' => 'Olivia', 'last_name' => 'Brown', 'email' => 'olivia.b@strata.org', 'company' => 'Strata Health', 'source' => 'Olark Chat', 'status' => 'qualified', 'score' => 76, 'estimated_value' => 15000, 'assigned_to' => $repId],
                ['first_name' => 'Samantha', 'last_name' => 'Reed', 'email' => 'samantha.r@beaconbio.com', 'company' => 'Beacon BioLabs', 'source' => 'Lead Add Form', 'status' => 'qualified', 'score' => 82, 'estimated_value' => 26000, 'assigned_to' => $alexId],
                
                ['first_name' => 'James', 'last_name' => 'Wilson', 'email' => 'james.w@veritas.com', 'company' => 'Veritas Media', 'source' => 'Organic Search', 'status' => 'contacted', 'score' => 68, 'estimated_value' => 12000, 'assigned_to' => $alexId],
                ['first_name' => 'Marcus', 'last_name' => 'Vance', 'email' => 'marcus.v@vancecorp.io', 'company' => 'Vance Logistics', 'source' => 'Direct Traffic', 'status' => 'contacted', 'score' => 58, 'estimated_value' => 18500, 'assigned_to' => $mgrId],
                
                ['first_name' => 'Ava', 'last_name' => 'Johnson', 'email' => 'ava.j@lumina.io', 'company' => 'Lumina Retail', 'source' => 'Direct Traffic', 'status' => 'new', 'score' => 72, 'estimated_value' => 9000, 'assigned_to' => $mgrId],
                ['first_name' => 'Lucas', 'last_name' => 'Martin', 'email' => 'lucas.m@inno.co', 'company' => 'InnoTech Solutions', 'source' => 'Website', 'status' => 'new', 'score' => 42, 'estimated_value' => 8000, 'assigned_to' => $repId],
                ['first_name' => 'Ethan', 'last_name' => 'Hunt', 'email' => 'ethan.h@apexsec.net', 'company' => 'Apex Security Group', 'source' => 'Lead Add Form', 'status' => 'new', 'score' => 65, 'estimated_value' => 14000, 'assigned_to' => $alexId],
                
                ['first_name' => 'Robert', 'last_name' => 'Chen', 'email' => 'robert.c@zenith.com', 'company' => 'Zenith Logistics', 'source' => 'Direct Traffic', 'status' => 'lost', 'score' => 34, 'estimated_value' => 11000, 'assigned_to' => $repId],
                ['first_name' => 'Arthur', 'last_name' => 'Pendelton', 'email' => 'arthur.p@legacysys.org', 'company' => 'Legacy Systems', 'source' => 'Organic Search', 'status' => 'lost', 'score' => 28, 'estimated_value' => 16000, 'assigned_to' => $alexId],
            ];

            foreach ($initialLeads as $leadData) {
                if (!Lead::where('email', $leadData['email'])->exists()) {
                    Lead::create(array_merge($leadData, [
                        'user_id' => $leadData['assigned_to'],
                        'created_by' => $leadData['assigned_to'],
                        'phone' => '+1 (555) ' . rand(100, 999) . '-' . rand(1000, 9999),
                        'job_title' => 'Director of Operations',
                        'industry' => 'Technology',
                        'budget' => $leadData['estimated_value'],
                        'country' => 'United States',
                    ]));
                }
            }
        }
    }
}

