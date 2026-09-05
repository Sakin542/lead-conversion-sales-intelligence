<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadActivity;

class FeatureEngineeringService
{
    /**
     * Extract and transform lead attributes and activities into ML feature payload.
     * Ensures strict alignment with features used during XGBoost training.
     */
    public function extractFeatures(Lead $lead): array
    {
        // Load recent activities if not already eager loaded
        $activities = $lead->relationLoaded('activities') ? $lead->activities : $lead->activities()->get();

        $emailOpens = $activities->where('type', 'email_open')->count();
        $calls = $activities->where('type', 'call')->count();
        $meetings = $activities->where('type', 'meeting')->count();
        $demos = $activities->where('type', 'demo_request')->count();
        $totalActivities = $activities->count();

        $latestActivity = $activities->sortByDesc('created_at')->first();
        $lastActivityType = 'Email Opened';

        if ($latestActivity) {
            $actType = $latestActivity->activity_type ?? $latestActivity->type;
            if ($actType === 'demo' || $actType === 'demo_request') {
                $lastActivityType = 'SMS Sent';
            } elseif ($actType === 'call') {
                $lastActivityType = 'Had a Phone Conversation';
            } elseif ($actType === 'email' || $actType === 'email_open') {
                $lastActivityType = 'Email Opened';
            } elseif ($actType === 'meeting') {
                $lastActivityType = 'Meeting Scheduled';
            }
        }

        $visits = max(1, $totalActivities + 2);
        $timeSpent = max(120, ($totalActivities * 85) + ($emailOpens * 120) + ($demos * 300));
        $pageViews = round(max(1.0, min(8.0, 1.5 + ($totalActivities * 0.4))), 1);

        $occupation = 'Working Professional';
        if ($lead->job_title && preg_match('/student|intern/i', $lead->job_title)) {
            $occupation = 'Student';
        } elseif ($lead->job_title && preg_match('/unemployed|none/i', $lead->job_title)) {
            $occupation = 'Unemployed';
        }

        return [
            // Standard ML training column names
            'Lead Origin' => $lead->lead_source ?? 'Landing Page Submission',
            'Lead Source' => $lead->source ?? 'Google',
            'Do Not Email' => 'No',
            'Do Not Call' => 'No',
            'TotalVisits' => $visits,
            'Total Time Spent on Website' => $timeSpent,
            'Page Views Per Visit' => $pageViews,
            'Last Activity' => $lastActivityType,
            'Country' => $lead->country ?? 'India',
            'Specialization' => $lead->industry ?? 'Media and Advertising',
            'What is your current occupation' => $occupation,
            'City' => 'Mumbai',
            'A free copy of Mastering The Interview' => 'No',
            'Last Notable Activity' => $lastActivityType,

            // Also include CRM feature keys for flexible microservice consumer
            'lead_age_days' => $lead->created_at ? $lead->created_at->diffInDays(now()) : 1,
            'email_open_count' => $emailOpens,
            'call_count' => $calls,
            'meeting_count' => $meetings,
            'demo_request_count' => $demos,
            'total_activity_count' => $totalActivities,
            'estimated_value' => (float) ($lead->estimated_value ?? 0),
            'industry' => $lead->industry ?? 'Technology',
            'company_size' => $lead->company_size ?? 'Medium',
        ];
    }
}

