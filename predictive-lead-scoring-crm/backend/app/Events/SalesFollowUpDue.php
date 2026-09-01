<?php

namespace App\Events;

use App\Models\FollowUp;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SalesFollowUpDue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public FollowUp $followUp)
    {
    }
}

