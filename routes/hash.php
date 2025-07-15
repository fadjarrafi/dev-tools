<?php

use App\Http\Controllers\Hash\BcryptController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('hash')->group(function () {

    // Bcrypt Generator Routes
    Route::get('bcrypt', [BcryptController::class, 'index'])
        ->middleware('permission:hash.view')
        ->name('hash.bcrypt.index');
});
