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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('SALES_REP')->after('email');
            $table->boolean('is_active')->default(true)->after('role');
            $table->string('invitation_token')->nullable()->after('is_active');
            $table->timestamp('invitation_expires_at')->nullable()->after('invitation_token');
            $table->foreignId('invited_by')->nullable()->after('invitation_expires_at')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['invited_by']);
            $table->dropColumn([
                'role',
                'is_active',
                'invitation_token',
                'invitation_expires_at',
                'invited_by',
            ]);
        });
    }
};

