<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('lead_scores')) {
            Schema::create('lead_scores', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lead_id')->constrained('leads')->onDelete('cascade');
                $table->integer('score')->default(0);
                $table->decimal('conversion_probability', 5, 4)->default(0.0000);
                $table->string('temperature', 20)->default('COLD'); // HOT, WARM, COLD
                $table->string('model_name', 100)->default('XGBoost');
                $table->timestamp('scored_at')->useCurrent();
                $table->timestamps();

                $table->index(['lead_id', 'scored_at']);
                $table->index('temperature');
                $table->index('score');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_scores');
    }
};

