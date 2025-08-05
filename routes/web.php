<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/test-excel', function () {
    return \Maatwebsite\Excel\Facades\Excel::download(new class implements \Maatwebsite\Excel\Concerns\FromArray {
        public function array(): array
        {
            return [
                ['Name', 'Email'],
                ['John Doe', 'john@example.com'],
                ['Jane Doe', 'jane@example.com'],
            ];
        }
    }, 'test.xlsx');
})->middleware('auth');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/hash.php';
require __DIR__ . '/tree.php';
require __DIR__ . '/notes.php';
require __DIR__ . '/kanban.php';
require __DIR__ . '/migration-generator.php';
require __DIR__ . '/excalidraw.php';
require __DIR__ . '/jobs.php';
