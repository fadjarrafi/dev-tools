<?php

use App\Http\Controllers\Note\NoteController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('notes')->group(function () {
    Route::get('/', [NoteController::class, 'index'])
        ->middleware('permission:notes.view')
        ->name('notes.index');

    Route::post('/', [NoteController::class, 'store'])
        ->middleware('permission:notes.create')
        ->name('notes.store');

    Route::put('/{note}', [NoteController::class, 'update'])
        ->middleware('permission:notes.edit')
        ->name('notes.update');

    Route::delete('/{note}', [NoteController::class, 'destroy'])
        ->middleware('permission:notes.delete')
        ->name('notes.destroy');
});
