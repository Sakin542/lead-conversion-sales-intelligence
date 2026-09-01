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
        Schema::table('leads', function (Blueprint $table) {
            if (!Schema::hasColumn('leads', 'assigned_to')) {
                $table->foreignId('assigned_to')->nullable()->after('user_id')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('leads', 'score')) {
                $table->integer('score')->default(0)->after('notes');
            }
            if (!Schema::hasColumn('leads', 'last_notified_score')) {
                $table->integer('last_notified_score')->nullable()->after('score');
            }
            if (!Schema::hasColumn('leads', 'hot_notified')) {
                $table->boolean('hot_notified')->default(false)->after('last_notified_score');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['assigned_to']);
            $table->dropColumn(['assigned_to', 'score', 'last_notified_score', 'hot_notified']);
        });
    }
};

