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
        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('notifications', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->index();
            }
            if (!Schema::hasColumn('notifications', 'title')) {
                $table->string('title')->nullable()->after('type');
            }
            if (!Schema::hasColumn('notifications', 'message')) {
                $table->text('message')->nullable()->after('title');
            }
            if (!Schema::hasColumn('notifications', 'entity_type')) {
                $table->string('entity_type')->nullable()->after('message');
            }
            if (!Schema::hasColumn('notifications', 'entity_id')) {
                $table->string('entity_id')->nullable()->after('entity_type');
            }
            if (!Schema::hasColumn('notifications', 'metadata')) {
                $table->text('metadata')->nullable()->after('entity_id');
            }
            if (!Schema::hasColumn('notifications', 'priority')) {
                $table->string('priority', 20)->default('NORMAL')->after('metadata');
            }
            if (!Schema::hasColumn('notifications', 'event_key')) {
                $table->string('event_key')->nullable()->after('priority')->index();
            }
            if (!Schema::hasColumn('notifications', 'is_read')) {
                $table->boolean('is_read')->default(false)->after('read_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $columns = ['user_id', 'title', 'message', 'entity_type', 'entity_id', 'metadata', 'priority', 'event_key', 'is_read'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('notifications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

