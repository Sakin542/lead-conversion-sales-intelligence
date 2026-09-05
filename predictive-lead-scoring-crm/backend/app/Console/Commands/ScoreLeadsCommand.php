<?php

namespace App\Console\Commands;

use App\Models\Lead;
use App\Services\MlPredictionService;
use Illuminate\Console\Command;

class ScoreLeadsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ml:score {--lead= : Specific Lead ID to score}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Score sales leads using the ML Prediction API microservice';

    /**
     * Execute the console command.
     */
    public function handle(MlPredictionService $mlService): int
    {
        $leadId = $this->option('lead');

        if ($leadId) {
            $lead = Lead::find($leadId);
            if (!$lead) {
                $this->error("Lead with ID #{$leadId} not found.");
                return Command::FAILURE;
            }

            $this->info("Scoring Lead #{$lead->id} ({$lead->first_name} {$lead->last_name})...");
            $result = $mlService->scoreAndUpdateLead($lead);

            $this->info("✓ Lead #{$lead->id} Scored Successfully!");
            $this->line("  - Conversion Probability: {$result['conversion_probability']}");
            $this->line("  - Lead Score: {$result['lead_score']}");
            $this->line("  - Classification: {$result['temperature']}");

            return Command::SUCCESS;
        }

        $leads = Lead::all();
        if ($leads->isEmpty()) {
            $this->warn("No leads found in database to score.");
            return Command::SUCCESS;
        }

        $this->info("Found {$leads->count()} leads. Beginning ML scoring...");
        $bar = $this->output->createProgressBar($leads->count());
        $bar->start();

        $count = 0;
        foreach ($leads as $lead) {
            $mlService->scoreAndUpdateLead($lead);
            $count++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✓ Successfully scored {$count} leads using ML Prediction API.");

        return Command::SUCCESS;
    }
}

