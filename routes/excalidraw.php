<?php

use App\Http\Controllers\Excalidraw\ExcalidrawController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/excalidraw', [ExcalidrawController::class, 'index'])->name('excalidraw.index');
    Route::get('/excalidraw/create', [ExcalidrawController::class, 'create'])->name('excalidraw.create');
    Route::post('/excalidraw', [ExcalidrawController::class, 'store'])->name('excalidraw.store');
    Route::get('/excalidraw/{excalidrawSketch}', [ExcalidrawController::class, 'show'])->name('excalidraw.show');
    Route::put('/excalidraw/{excalidrawSketch}', [ExcalidrawController::class, 'update'])->name('excalidraw.update');
    Route::delete('/excalidraw/{excalidrawSketch}', [ExcalidrawController::class, 'destroy'])->name('excalidraw.destroy');
});
