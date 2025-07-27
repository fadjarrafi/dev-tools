<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExcalidrawSketch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'data',
        'user_id',
    ];

    protected $casts = [
        'data' => 'array', // Cast the 'data' attribute to an array
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
