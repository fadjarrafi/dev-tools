<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'position_title',
        'location',
        'salary_range',
        'job_type',
        'status',
        'application_date',
        'deadline',
        'job_description',
        'notes',
    ];

    protected $casts = [
        'application_date' => 'date',
        'deadline' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Available job statuses
     */
    public const STATUSES = [
        'Applied',
        'Technical Interview',
        'Final Interview',
        'Offer',
        'Rejected',
        'Withdrawn'
    ];

    /**
     * Available job types
     */
    public const JOB_TYPES = [
        'Remote',
        'Hybrid',
        'Onsite',
        'Contract',
        'Part-time',
        'Full-time'
    ];

    /**
     * Get the user that owns the job application.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the history records for the job application.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(JobApplicationHistory::class)->orderBy('changed_at', 'desc');
    }

    /**
     * Boot the model to track changes
     */
    protected static function booted(): void
    {
        static::updating(function (JobApplication $jobApplication) {
            $original = $jobApplication->getOriginal();
            $changes = $jobApplication->getDirty();

            foreach ($changes as $field => $newValue) {
                if ($field === 'updated_at') continue;

                $oldValue = $original[$field] ?? null;

                // Only log if value actually changed
                if ($oldValue != $newValue) {
                    JobApplicationHistory::create([
                        'job_application_id' => $jobApplication->id,
                        'field_changed' => $field,
                        'old_value' => $oldValue,
                        'new_value' => $newValue,
                        'changed_at' => now(),
                    ]);
                }
            }
        });
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'Applied' => 'bg-blue-100 text-blue-800',
            'Technical Interview' => 'bg-yellow-100 text-yellow-800',
            'Final Interview' => 'bg-orange-100 text-orange-800',
            'Offer' => 'bg-green-100 text-green-800',
            'Rejected' => 'bg-red-100 text-red-800',
            'Withdrawn' => 'bg-gray-100 text-gray-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Check if application is in progress
     */
    public function getIsInProgressAttribute(): bool
    {
        return in_array($this->status, ['Applied', 'Technical Interview', 'Final Interview']);
    }

    /**
     * Check if application is completed
     */
    public function getIsCompletedAttribute(): bool
    {
        return in_array($this->status, ['Offer', 'Rejected', 'Withdrawn']);
    }

    /**
     * Scope for user's applications
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for applications by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for applications within date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('application_date', [$startDate, $endDate]);
    }
}
