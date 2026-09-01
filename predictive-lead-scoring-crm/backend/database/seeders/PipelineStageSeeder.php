<?php

namespace Database\Seeders;

use App\Models\PipelineStage;
use Illuminate\Database\Seeder;

class PipelineStageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stages = [
            ['name' => 'New Lead', 'slug' => 'new-lead', 'position' => 1],
            ['name' => 'Contacted', 'slug' => 'contacted', 'position' => 2],
            ['name' => 'Qualified', 'slug' => 'qualified', 'position' => 3],
            ['name' => 'Proposal', 'slug' => 'proposal', 'position' => 4],
            ['name' => 'Negotiation', 'slug' => 'negotiation', 'position' => 5],
            ['name' => 'Won', 'slug' => 'won', 'position' => 6],
            ['name' => 'Lost', 'slug' => 'lost', 'position' => 7],
        ];

        foreach ($stages as $stage) {
            PipelineStage::updateOrCreate(
                ['slug' => $stage['slug']],
                ['name' => $stage['name'], 'position' => $stage['position']]
            );
        }
    }
}

