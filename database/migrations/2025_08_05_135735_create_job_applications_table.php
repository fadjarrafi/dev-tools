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
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name');
            $table->string('position_title');
            $table->string('location')->nullable();
            $table->string('salary_range')->nullable();
            $table->enum('job_type', ['Remote', 'Hybrid', 'Onsite', 'Contract', 'Part-time', 'Full-time']);
            $table->enum('status', [
                'Applied',
                'Technical Interview',
                'Final Interview',
                'Offer',
                'Rejected',
                'Withdrawn'
            ])->default('Applied');
            $table->date('application_date');
            $table->date('deadline')->nullable();
            $table->text('job_description')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'application_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
