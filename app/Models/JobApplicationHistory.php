<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplicationHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_application_id',
        'field_changed',
        'old_value',
        'new_value',
        'changed_at',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the job application that owns the history record.
     */
    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class);
    }

    /**
     * Get formatted field name for display
     */
    public function getFormattedFieldNameAttribute(): string
    {
        return match ($this->field_changed) {
            'company_name' => 'Company Name',
            'position_title' => 'Position Title',
            'location' => 'Location',
            'salary_range' => 'Salary Range',
            'job_type' => 'Job Type',
            'status' => 'Status',
            'application_date' => 'Application Date',
            'deadline' => 'Deadline',
            'job_description' => 'Job Description',
            'notes' => 'Notes',
            default => ucwords(str_replace('_', ' ', $this->field_changed)),
        };
    }

    /**
     * Get formatted old value for display
     */
    public function getFormattedOldValueAttribute(): string
    {
        if ($this->old_value === null) {
            return 'Empty';
        }

        if ($this->field_changed === 'application_date' || $this->field_changed === 'deadline') {
            try {
                return \Carbon\Carbon::parse($this->old_value)->format('M d, Y');
            } catch (\Exception $e) {
                return $this->old_value;
            }
        }

        return $this->old_value;
    }

    /**
     * Get formatted new value for display
     */
    public function getFormattedNewValueAttribute(): string
    {
        if ($this->new_value === null) {
            return 'Empty';
        }

        if ($this->field_changed === 'application_date' || $this->field_changed === 'deadline') {
            try {
                return \Carbon\Carbon::parse($this->new_value)->format('M d, Y');
            } catch (\Exception $e) {
                return $this->new_value;
            }
        }

        return $this->new_value;
    }
}
