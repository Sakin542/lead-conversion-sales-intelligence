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
use Illuminate\Support\Collection;

class BatchScoreLeadsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Collection $leadIds;
    public int $tries = 3;
    public array $backoff = [5, 15, 30];

    /**
     * Create a new job instance.
     */
    public function __construct(Collection|array $leadIds)
    {
        $this->leadIds = collect($leadIds);
        $this->onQueue('scoring');
    }

    /**
     * Execute the job.
     */
    public function handle(MlPredictionService $mlService): void
    {
        $leads = Lead::whereIn('id', $this->leadIds)->get();
        if ($leads->isEmpty()) {
            return;
        }

        $payloads = [];
        foreach ($leads as $lead) {
            $payloads[] = [
                'Lead Origin' => $lead->lead_source ?? 'Landing Page Submission',
                'Lead Source' => $lead->source ?? 'Google',
                'Do Not Email' => 'No',
                'Do Not Call' => 'No',
                'TotalVisits' => $lead->total_visits ?? 5,
                'Total Time Spent on Website' => $lead->time_spent ?? 450,
                'Page Views Per Visit' => 3.5,
                'Last Activity' => 'Email Opened',
            ];
        }

        $predictions = $mlService->predictBatch($payloads);
        $threshold = (int) env('HOT_LEAD_SCORE_THRESHOLD', 80);

        foreach ($leads as $index => $lead) {
            $pred = $predictions[$index] ?? null;
            if ($pred && isset($pred['lead_score'])) {
                $previousScore = $lead->score;
                $newScore = (int) round($pred['lead_score']);

                $lead->score = $newScore;
                $lead->save();

                // Alert assigned rep if crossed into HOT threshold
                if ($newScore >= $threshold && ($previousScore === null || $previousScore < $threshold)) {
                    if ($lead->assigned_to) {
                        NotificationService::createNotification(
                            $lead->assigned_to,
                            'HOT_LEAD_ALERT',
                            '🔥 Hot Lead Alert!',
                            "Lead {$lead->first_name} {$lead->last_name} scored {$newScore}% conversion probability.",
                            'Lead',
                            (string) $lead->id,
                            ['score' => $newScore],
                            'HIGH',
                            "hot-lead-batch-{$lead->id}-{$newScore}"
                        );
                    }
                }
            }
        }
    }
}

