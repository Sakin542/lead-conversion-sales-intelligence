<?php

namespace App\Console\Commands;

use App\Jobs\BatchScoreLeadsJob;
use App\Models\Lead;
use Illuminate\Console\Command;

class BatchScoreLeadsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ml:batch-score 
                            {--chunk=100 : Number of leads per job chunk}
                            {--unscored-only : Only score leads that do not have a score}
                            {--sync : Execute synchronously instead of queueing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch batch scoring jobs for all leads in chunks';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $chunkSize = (int) ($this->option('chunk') ?: 100);
        $unscoredOnly = (bool) $this->option('unscored-only');
        $sync = (bool) $this->option('sync');

        $query = Lead::query();
        if ($unscoredOnly) {
            $query->whereNull('score')->orWhere('score', 0);
        }

        $totalLeads = $query->count();
        if ($totalLeads === 0) {
            $this->warn('No matching leads found to score.');
            return Command::SUCCESS;
        }

        $this->info("Found {$totalLeads} leads to batch score in chunks of {$chunkSize}.");

        $leadIds = $query->pluck('id')->toArray();
        $chunks = array_chunk($leadIds, $chunkSize);

        $bar = $this->output->createProgressBar(count($chunks));
        $bar->start();

        foreach ($chunks as $chunkIds) {
            if ($sync) {
                BatchScoreLeadsJob::dispatchSync($chunkIds);
            } else {
                BatchScoreLeadsJob::dispatch($chunkIds);
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✓ Dispatched " . count($chunks) . " batch scoring jobs for {$totalLeads} leads.");

        return Command::SUCCESS;
    }
}
