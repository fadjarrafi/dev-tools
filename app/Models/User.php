<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_protected',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_protected' => 'boolean',
        ];
    }

    /**
     * Check if user is protected (cannot be deleted)
     */
    public function isProtected(): bool
    {
        return $this->is_protected || $this->email === 'admin@example.com';
    }

    /**
     * Check if user is administrator
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('Admin');
    }
}
