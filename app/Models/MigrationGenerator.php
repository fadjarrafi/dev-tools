<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MigrationGenerator extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sql_schema',
        'generated_migration',
        'migration_file_path',
        'status',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'status_color',
    ];

    /**
     * Get the user who created this migration
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the status badge color
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'generated' => 'bg-blue-100 text-blue-800',
            'saved' => 'bg-green-100 text-green-800',
            'error' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }
}
