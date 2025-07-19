<?php

use App\Http\Controllers\Tree\TreeGeneratorController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::prefix('tree')->group(function () {
        Route::get('/', [TreeGeneratorController::class, 'index'])
            ->middleware('permission:tree.view')
            ->name('tree.index');

        Route::post('/', [TreeGeneratorController::class, 'store'])
            ->middleware('permission:tree.view')
            ->name('tree.store');

        Route::put('/{tree}', [TreeGeneratorController::class, 'update'])
            ->middleware('permission:tree.view')
            ->name('tree.update');

        Route::delete('/{tree}', [TreeGeneratorController::class, 'destroy'])
            ->middleware('permission:tree.view')
            ->name('tree.destroy');
    });
});
