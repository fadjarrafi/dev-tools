<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\PermissionController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\RoleController;
use App\Http\Controllers\Settings\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    // Profile Settings - No permissions needed (users can edit their own profile)
    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Password Settings - No permissions needed (users can change their own password)
    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    // Appearance Settings - No permissions needed
    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    // User Management - Permission-based access (no role checks)
    Route::prefix('settings')->group(function () {

        // User Management Routes
        Route::get('users', [UserController::class, 'index'])
            ->middleware('permission:users.view')
            ->name('users.index');

        Route::get('users/create', [UserController::class, 'create'])
            ->middleware('permission:users.create')
            ->name('users.create');

        Route::post('users', [UserController::class, 'store'])
            ->middleware('permission:users.create')
            ->name('users.store');

        Route::get('users/{user}/edit', [UserController::class, 'edit'])
            ->middleware('permission:users.edit')
            ->name('users.edit');

        Route::put('users/{user}', [UserController::class, 'update'])
            ->middleware('permission:users.edit')
            ->name('users.update');

        Route::delete('users/{user}', [UserController::class, 'destroy'])
            ->middleware('permission:users.delete')
            ->name('users.destroy');

        // Role Management Routes
        Route::get('roles', [RoleController::class, 'index'])
            ->middleware('permission:roles.view')
            ->name('roles.index');

        Route::get('roles/create', [RoleController::class, 'create'])
            ->middleware('permission:roles.create')
            ->name('roles.create');

        Route::post('roles', [RoleController::class, 'store'])
            ->middleware('permission:roles.create')
            ->name('roles.store');

        Route::get('roles/{role}/edit', [RoleController::class, 'edit'])
            ->middleware('permission:roles.edit')
            ->name('roles.edit');

        Route::put('roles/{role}', [RoleController::class, 'update'])
            ->middleware('permission:roles.edit')
            ->name('roles.update');

        Route::delete('roles/{role}', [RoleController::class, 'destroy'])
            ->middleware('permission:roles.delete')
            ->name('roles.destroy');

        // Permission Management Routes
        Route::get('permissions', [PermissionController::class, 'index'])
            ->middleware('permission:permissions.view')
            ->name('permissions.index');

        Route::get('permissions/create', [PermissionController::class, 'create'])
            ->middleware('permission:permissions.create')
            ->name('permissions.create');

        Route::post('permissions', [PermissionController::class, 'store'])
            ->middleware('permission:permissions.create')
            ->name('permissions.store');

        Route::get('permissions/{permission}/edit', [PermissionController::class, 'edit'])
            ->middleware('permission:permissions.edit')
            ->name('permissions.edit');

        Route::put('permissions/{permission}', [PermissionController::class, 'update'])
            ->middleware('permission:permissions.edit')
            ->name('permissions.update');

        Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])
            ->middleware('permission:permissions.delete')
            ->name('permissions.destroy');
    });
});
