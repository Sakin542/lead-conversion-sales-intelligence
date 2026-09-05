<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Services\MlPredictionService;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ScoreLeadJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Lead $lead;
    public int $tries = 3;
    public array $backoff = [5, 15, 30];

    /**
     * Create a new job instance.
     */
    public function __construct(Lead $lead)
    {
        $this->lead = $lead;
        if (!app()->environment('testing')) {
            $this->onQueue('scoring');
        }
    }

    /**
     * Execute the job.
     */
    public function handle(MlPredictionService $mlService): void
    {
        Log::info("Scoring Lead #{$this->lead->id} via ML Prediction Pipeline...");

        $previousScore = $this->lead->score;
        $result = $mlService->scoreLead($this->lead);

        $newScore = (int) round($result['lead_score'] ?? 0);
        $threshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);

        Log::info("Lead #{$this->lead->id} Scored: {$newScore} ({$result['temperature']})");

        // Check if lead crossed into HOT threshold
        if ($newScore >= $threshold && ($previousScore === null || $previousScore < $threshold)) {
            $assignedRep = $this->lead->assigned_to ?? $this->lead->user_id;
            if ($assignedRep) {
                NotificationService::createNotification(
                    $assignedRep,
                    'HOT_LEAD_ALERT',
                    '🔥 Hot Lead Alert!',
                    "Lead {$this->lead->first_name} {$this->lead->last_name} scored {$newScore}% conversion probability ({$result['temperature']}).",
                    'Lead',
                    (string) $this->lead->id,
                    ['score' => $newScore, 'temperature' => $result['temperature']],
                    'HIGH',
                    "hot-lead-{$this->lead->id}-{$newScore}"
                );
            }
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("ScoreLeadJob permanently failed for Lead #{$this->lead->id}: " . $exception->getMessage());
    }
}

