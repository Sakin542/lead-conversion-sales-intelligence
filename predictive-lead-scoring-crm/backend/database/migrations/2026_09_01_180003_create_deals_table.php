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
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('lead_id')->constrained()->onDelete('cascade');
            $table->foreignId('pipeline_stage_id')->constrained('pipeline_stages')->onDelete('cascade');
            $table->string('title');
            $table->decimal('value', 12, 2)->default(0.00);
            $table->date('expected_close_date')->nullable();
            $table->integer('probability')->default(50);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'pipeline_stage_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};

