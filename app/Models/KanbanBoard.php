<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KanbanBoard extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'name',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the project that owns the board.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(KanbanProject::class, 'project_id');
    }

    /**
     * Get the columns for the board.
     */
    public function columns(): HasMany
    {
        return $this->hasMany(KanbanColumn::class, 'board_id')->orderBy('sort_order');
    }

    /**
     * Create default columns for a new board.
     */
    public function createDefaultColumns(): void
    {
        $defaultColumns = [
            ['name' => 'To Do', 'color' => '#ef4444', 'sort_order' => 1],
            ['name' => 'In Progress', 'color' => '#f59e0b', 'sort_order' => 2],
            ['name' => 'Done', 'color' => '#10b981', 'sort_order' => 3],
        ];

        foreach ($defaultColumns as $column) {
            $this->columns()->create($column);
        }
    }
}
