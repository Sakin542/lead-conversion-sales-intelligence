<?php

namespace App\Http\Controllers\Api;

use App\Events\HotLeadDetected;
use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\NotificationPreference;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class PublicLeadController extends Controller
{
    /**
     * Handle Public Website Lead Submission.
     * Endpoint: POST /api/public/leads
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Validate incoming public fields
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'company' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:100'],
            'interested_in' => ['nullable', 'string', 'max:255'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'estimated_value' => ['nullable', 'numeric', 'min:0'],
            'revenue' => ['nullable', 'numeric', 'min:0'],
            'company_size' => ['nullable', 'string', 'max:100'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'string', 'max:255'],
            'preferred_contact_method' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $email = strtolower(trim($validated['email']));

        // 2. Duplicate Detection (Security: Return generic success without revealing database records)
        $existingLead = Lead::where('email', $email)->first();
        if (!$existingLead && !empty($validated['phone'])) {
            $existingLead = Lead::where('phone', trim($validated['phone']))->first();
        }

        if ($existingLead) {
            return response()->json([
                'success' => true,
                'message' => 'Thank you. Your inquiry has already been received. Our sales team will contact you soon.',
            ], 200);
        }

        // 3. Resolve First & Last Name
        $firstName = $validated['first_name'] ?? '';
        $lastName = $validated['last_name'] ?? '';

        if (empty($firstName) && !empty($validated['name'])) {
            $parts = explode(' ', trim($validated['name']), 2);
            $firstName = $parts[0];
            $lastName = $parts[1] ?? '';
        }

        if (empty($firstName)) {
            $firstName = 'Website';
        }
        if (empty($lastName)) {
            $lastName = 'Prospect';
        }

        $company = !empty($validated['company']) ? trim($validated['company']) : 'Inquiry Prospect';
        $budget = $validated['budget'] ?? ($validated['estimated_value'] ?? ($validated['revenue'] ?? null));

        // 4. Force strict backend-controlled fields (Ignore any client-supplied internal security fields)
        $leadData = [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'phone' => $validated['phone'] ?? null,
            'company' => $company,
            'job_title' => $validated['job_title'] ?? null,
            'industry' => $validated['industry'] ?? null,
            'company_size' => $validated['company_size'] ?? null,
            'country' => $validated['country'] ?? null,
            'website' => $validated['website'] ?? null,
            'interested_in' => $validated['interested_in'] ?? null,
            'preferred_contact_method' => $validated['preferred_contact_method'] ?? null,
            'estimated_value' => $budget,
            'budget' => $budget,
            'message' => $validated['message'] ?? null,
            'notes' => !empty($validated['message']) ? "Public Inquiry Message: " . $validated['message'] : null,
            'source' => 'WEBSITE',
            'status' => 'new',
            'assigned_to' => null,
            'created_by' => null,
            'user_id' => null,
        ];

        // 5. Calculate Initial AI Score with Graceful Fallback
        $calculatedScore = $this->calculateAiScore($leadData);
        $leadData['score'] = $calculatedScore;

        // Filter attributes to ensure only columns present in the leads table are inserted
        $insertData = [];
        foreach ($leadData as $key => $val) {
            if (Schema::hasColumn('leads', $key)) {
                $insertData[$key] = $val;
            }
        }

        try {
            $lead = Lead::create($insertData);
        } catch (\Throwable $e) {
            Log::error('Failed to insert public lead: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your inquiry. Please try again.',
            ], 500);
        }

        // 6. Trigger AI Hot Lead Event & Notifications
        try {
            $hotThreshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);
            if ($calculatedScore >= $hotThreshold) {
                event(new HotLeadDetected($lead, $calculatedScore));
            }

            // Create internal system notification for Admins & Managers
            $this->notifyInternalTeam($lead, $calculatedScore);
        } catch (\Throwable $e) {
            Log::warning('Public lead notification dispatch issue: ' . $e->getMessage());
        }

        // 7. Send Public Confirmation Email (Safe Wrapper)
        try {
            $this->sendPublicConfirmationEmail($email, $firstName);
        } catch (\Throwable $e) {
            Log::info('Public lead email confirmation skipped: ' . $e->getMessage());
        }

        // 8. Return Safe Public Response (NO Internal IDs or ML Model Internal Details)
        return response()->json([
            'success' => true,
            'message' => 'Thank you! Your inquiry has been submitted successfully. Our sales team will contact you soon.',
        ], 201);
    }

    /**
     * Compute Heuristic AI Lead Score (0-100) from Firmographic & Intent Signals.
     */
    private function calculateAiScore(array $data): int
    {
        try {
            $score = 30; // Baseline for explicit website inquiry

            // Budget Intent
            $budget = (float) ($data['budget'] ?? 0);
            if ($budget >= 50000) {
                $score += 35;
            } elseif ($budget >= 10000) {
                $score += 25;
            } elseif ($budget >= 2000) {
                $score += 15;
            }

            // Industry & Company Alignment
            $industry = strtolower($data['industry'] ?? '');
            if (in_array($industry, ['saas', 'software', 'finance', 'technology', 'enterprise', 'healthcare'])) {
                $score += 15;
            }

            // High Intent Job Titles
            $jobTitle = strtolower($data['job_title'] ?? '');
            if (Str::contains($jobTitle, ['vp', 'director', 'head', 'chief', 'ceo', 'cto', 'cfo', 'manager', 'founder', 'owner'])) {
                $score += 15;
            }

            // Message Intent Keywords
            $message = strtolower($data['message'] ?? '');
            if (Str::contains($message, ['demo', 'pricing', 'quote', 'buy', 'urgent', 'implementation', 'enterprise', 'contract'])) {
                $score += 10;
            }

            return (int) min(99, max(15, $score));
        } catch (\Throwable $e) {
            return 45; // Safe default score if scoring calculation fails
        }
    }

    /**
     * Create Internal System Notifications for Admin & Sales Manager.
     */
    private function notifyInternalTeam(Lead $lead, int $score): void
    {
        try {
            $type = $score >= 80 ? 'HOT_LEAD_DETECTED' : 'NEW_LEAD';
            $title = $score >= 80 ? "🔥 HOT Website Lead Captured" : "🌐 New Website Lead Inquiry";
            $message = "{$lead->first_name} {$lead->last_name} from {$lead->company} submitted a web inquiry. AI Score: {$score}/100.";
            $priority = $score >= 80 ? 'HIGH' : 'NORMAL';

            NotificationService::notifyRole(
                ['ADMIN', 'SALES_MANAGER'],
                $type,
                $title,
                $message,
                'Lead',
                (string) $lead->id,
                ['score' => $score, 'lead_id' => $lead->id, 'company' => $lead->company],
                $priority,
                "public-lead:{$lead->id}"
            );
        } catch (\Throwable $e) {
            Log::warning('Internal team notification error: ' . $e->getMessage());
        }
    }

    /**
     * Send Public Submitter Confirmation Email.
     */
    private function sendPublicConfirmationEmail(string $email, string $firstName): void
    {
        // Safe placeholder email send wrapper
        // Mail::to($email)->send(new \App\Mail\PublicLeadConfirmationMail($firstName));
    }
}

