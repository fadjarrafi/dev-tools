<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KanbanTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'column_id',
        'title',
        'description',
        'priority',
        'tags',
        'due_date',
        'sort_order',
    ];

    protected $casts = [
        'tags' => 'array',
        'due_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the column that owns the task.
     */
    public function column(): BelongsTo
    {
        return $this->belongsTo(KanbanColumn::class, 'column_id');
    }

    /**
     * Get the attachments for the task.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(KanbanTaskAttachment::class, 'task_id');
    }

    /**
     * Get the priority color class.
     */
    public function getPriorityColorAttribute(): string
    {
        return match ($this->priority) {
            'Low' => 'bg-gray-100 text-gray-800',
            'Medium' => 'bg-yellow-100 text-yellow-800',
            'High' => 'bg-orange-100 text-orange-800',
            'Critical' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Check if the task is overdue.
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date && $this->due_date->isPast();
    }

    /**
     * Check if the task is due soon (within 3 days).
     */
    public function getIsDueSoonAttribute(): bool
    {
        return $this->due_date && $this->due_date->isFuture() && $this->due_date->diffInDays() <= 3;
    }
}
