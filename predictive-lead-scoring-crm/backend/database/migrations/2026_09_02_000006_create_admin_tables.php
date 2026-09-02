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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('entity_type')->nullable();
            $table->string('entity_id')->nullable();
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('datasets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('file_path')->nullable();
            $table->integer('row_count')->default(0);
            $table->integer('column_count')->default(0);
            $table->integer('missing_values_count')->default(0);
            $table->integer('duplicate_count')->default(0);
            $table->string('status')->default('valid');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('ml_models', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('version');
            $table->float('accuracy')->default(0);
            $table->float('precision')->default(0);
            $table->float('recall')->default(0);
            $table->float('f1_score')->default(0);
            $table->float('roc_auc')->default(0);
            $table->boolean('is_active')->default(false);
            $table->json('feature_importance')->nullable();
            $table->timestamp('last_trained_at')->nullable();
            $table->timestamps();
        });

        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('subject');
            $table->longText('body_html');
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value');
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('email_templates');
        Schema::dropIfExists('ml_models');
        Schema::dropIfExists('datasets');
        Schema::dropIfExists('audit_logs');
    }
};

