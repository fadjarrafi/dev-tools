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
        Schema::create('trees', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->text('generated_tree');
            $table->timestamps();
        });

        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('content');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('kanban_projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
        });

        Schema::create('kanban_boards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('kanban_projects')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('kanban_columns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('board_id')->constrained('kanban_boards')->onDelete('cascade');
            $table->string('name');
            $table->integer('sort_order')->default(0);
            $table->string('color')->default('#6b7280'); // Default gray color
            $table->timestamps();
        });

        Schema::create('kanban_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('column_id')->constrained('kanban_columns')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('priority', ['Low', 'Medium', 'High', 'Critical'])->default('Medium');
            $table->json('tags')->nullable(); // Store tags as JSON array
            $table->date('due_date')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('kanban_task_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('kanban_tasks')->onDelete('cascade');
            $table->string('filename'); // Original filename
            $table->string('path'); // Storage path
            $table->string('mime_type');
            $table->integer('size'); // File size in bytes
            $table->timestamps();
        });

        Schema::create('migration_generators', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->longText('sql_schema');
            $table->longText('generated_migration');
            $table->string('migration_file_path')->nullable();
            $table->enum('status', ['generated', 'saved', 'error'])->default('generated');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['created_by', 'created_at']);
            $table->index('status');
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trees');
        Schema::dropIfExists('notes');
        Schema::dropIfExists('kanban_projects');
        Schema::dropIfExists('kanban_boards');
        Schema::dropIfExists('kanban_columns');
        Schema::dropIfExists('kanban_tasks');
        Schema::dropIfExists('kanban_task_attachments');
        Schema::dropIfExists('migration_generators');
    }
};
