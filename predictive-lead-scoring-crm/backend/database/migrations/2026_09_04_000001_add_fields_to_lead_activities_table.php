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
        Schema::table('lead_activities', function (Blueprint $table) {
            if (!Schema::hasColumn('lead_activities', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('lead_id')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('lead_activities', 'activity_type')) {
                $table->string('activity_type')->nullable()->after('type');
            }
            if (!Schema::hasColumn('lead_activities', 'outcome')) {
                $table->string('outcome')->nullable()->after('description');
            }
            if (!Schema::hasColumn('lead_activities', 'notes')) {
                $table->text('notes')->nullable()->after('outcome');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lead_activities', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('lead_activities', 'user_id')) {
                $columnsToDrop[] = 'user_id';
            }
            if (Schema::hasColumn('lead_activities', 'activity_type')) {
                $columnsToDrop[] = 'activity_type';
            }
            if (Schema::hasColumn('lead_activities', 'outcome')) {
                $columnsToDrop[] = 'outcome';
            }
            if (Schema::hasColumn('lead_activities', 'notes')) {
                $columnsToDrop[] = 'notes';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};

