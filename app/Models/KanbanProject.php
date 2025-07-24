<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KanbanProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_archived',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the boards for the project.
     */
    public function boards(): HasMany
    {
        return $this->hasMany(KanbanBoard::class, 'project_id');
    }

    /**
     * Get active (non-archived) projects.
     */
    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    /**
     * Get archived projects.
     */
    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }
}
