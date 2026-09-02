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
            if (!Schema::hasColumn('leads', 'created_by')) {
                $table->foreignId('created_by')->nullable()->after('assigned_to')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('leads', 'country')) {
                $table->string('country')->nullable()->after('industry');
            }
            if (!Schema::hasColumn('leads', 'website')) {
                $table->string('website')->nullable()->after('company');
            }
            if (!Schema::hasColumn('leads', 'interested_in')) {
                $table->string('interested_in')->nullable()->after('job_title');
            }
            if (!Schema::hasColumn('leads', 'budget')) {
                $table->decimal('budget', 12, 2)->nullable()->after('estimated_value');
            }
            if (!Schema::hasColumn('leads', 'preferred_contact_method')) {
                $table->string('preferred_contact_method')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('leads', 'message')) {
                $table->text('message')->nullable()->after('notes');
            }
        });

        // Ensure user_id column is nullable for public unauthenticated submissions
        try {
            Schema::table('leads', function (Blueprint $table) {
                $table->foreignId('user_id')->nullable()->change();
            });
        } catch (\Throwable $e) {
            // SQLite or driver limitation fallback handled gracefully
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn([
                'created_by',
                'country',
                'website',
                'interested_in',
                'budget',
                'preferred_contact_method',
                'message',
            ]);
        });
    }
};

