<?php

namespace App\Console\Commands;

use App\Events\SalesFollowUpDue;
use App\Models\FollowUp;
use Illuminate\Console\Command;

class SendFollowUpReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reminders:send-follow-ups';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Find pending sales follow-ups and dispatch email reminders to sales representatives';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking upcoming sales follow-ups...');

        $now = now();

        $dueFollowUps = FollowUp::where('status', 'pending')
            ->where('reminder_sent', false)
            ->where('scheduled_at', '<=', $now)
            ->with(['lead', 'user'])
            ->get();

        $sentCount = 0;

        foreach ($dueFollowUps as $followUp) {
            try {
                event(new SalesFollowUpDue($followUp));
                $sentCount++;
            } catch (\Throwable $e) {
                $this->error("Failed to send reminder for follow-up ID {$followUp->id}: {$e->getMessage()}");
            }
        }

        $this->info("Successfully processed {$sentCount} follow-up reminders.");

        return Command::SUCCESS;
    }
}

