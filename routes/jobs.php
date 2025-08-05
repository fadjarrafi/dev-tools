<?php

use App\Http\Controllers\Jobs\JobApplicationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('jobs')->group(function () {

    // Export routes - Place these BEFORE the resource routes to avoid conflicts
    Route::get('/export/csv', [JobApplicationController::class, 'exportCsv'])
        ->middleware('permission:jobs.view')
        ->name('jobs.export.csv');

    Route::get('/export/excel', [JobApplicationController::class, 'exportExcel'])
        ->middleware('permission:jobs.view')
        ->name('jobs.export.excel');

    // Statistics route
    Route::get('/statistics', [JobApplicationController::class, 'statistics'])
        ->middleware('permission:jobs.view')
        ->name('jobs.statistics');

    // Main job applications routes
    Route::get('/', [JobApplicationController::class, 'index'])
        ->middleware('permission:jobs.view')
        ->name('jobs.index');

    Route::get('/create', [JobApplicationController::class, 'create'])
        ->middleware('permission:jobs.create')
        ->name('jobs.create');

    Route::post('/', [JobApplicationController::class, 'store'])
        ->middleware('permission:jobs.create')
        ->name('jobs.store');

    Route::get('/{jobApplication}', [JobApplicationController::class, 'show'])
        ->middleware('permission:jobs.view')
        ->name('jobs.show');

    Route::get('/{jobApplication}/edit', [JobApplicationController::class, 'edit'])
        ->middleware('permission:jobs.edit')
        ->name('jobs.edit');

    Route::put('/{jobApplication}', [JobApplicationController::class, 'update'])
        ->middleware('permission:jobs.edit')
        ->name('jobs.update');

    Route::delete('/{jobApplication}', [JobApplicationController::class, 'destroy'])
        ->middleware('permission:jobs.delete')
        ->name('jobs.destroy');
});
