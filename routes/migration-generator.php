<?php

use App\Http\Controllers\MigrationGenerator\MigrationGeneratorController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('tools')->group(function () {

    // Migration Generator Routes
    Route::get('migration-generator', [MigrationGeneratorController::class, 'index'])
        ->middleware('permission:migration.view')
        ->name('tools.migration-generator.index');

    Route::post('migration-generator', [MigrationGeneratorController::class, 'generate'])
        ->middleware('permission:migration.create')
        ->name('tools.migration-generator.generate');

    Route::post('migration-generator/{migration}/save', [MigrationGeneratorController::class, 'save'])
        ->middleware('permission:migration.create')
        ->name('tools.migration-generator.save');

    Route::get('migration-generator/{migration}/download', [MigrationGeneratorController::class, 'download'])
        ->middleware('permission:migration.view')
        ->name('tools.migration-generator.download');

    Route::post('migration-generator/{migration}/duplicate', [MigrationGeneratorController::class, 'duplicate'])
        ->middleware('permission:migration.create')
        ->name('tools.migration-generator.duplicate');

    Route::delete('migration-generator/{migration}', [MigrationGeneratorController::class, 'destroy'])
        ->middleware('permission:migration.delete')
        ->name('tools.migration-generator.destroy');
});
