<?php

namespace App\Observers;

use App\Jobs\ScoreLeadJob;
use App\Models\Lead;

class LeadObserver
{
    /**
     * Handle the Lead "created" event.
     */
    public function created(Lead $lead): void
    {
        if ($lead->score === null || $lead->score === 0) {
            ScoreLeadJob::dispatch($lead);
        }
    }
}

