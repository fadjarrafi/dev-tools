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
        Schema::create('job_application_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained()->onDelete('cascade');
            $table->string('field_changed'); // 'status', 'salary_range', etc.
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->timestamp('changed_at');
            $table->timestamps();

            $table->index(['job_application_id', 'changed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_application_histories');
    }
};
