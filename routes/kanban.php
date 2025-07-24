<?php

use App\Http\Controllers\Kanban\KanbanBoardController;
use App\Http\Controllers\Kanban\KanbanColumnController;
use App\Http\Controllers\Kanban\KanbanProjectController;
use App\Http\Controllers\Kanban\KanbanTaskController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('kanban')->group(function () {

    // Project Routes
    Route::get('/', [KanbanProjectController::class, 'index'])
        ->middleware('permission:kanban.view')
        ->name('kanban.projects.index');

    Route::get('/projects/create', [KanbanProjectController::class, 'create'])
        ->middleware('permission:kanban.create')
        ->name('kanban.projects.create');

    Route::post('/projects', [KanbanProjectController::class, 'store'])
        ->middleware('permission:kanban.create')
        ->name('kanban.projects.store');

    Route::get('/projects/{project}', [KanbanProjectController::class, 'show'])
        ->middleware('permission:kanban.view')
        ->name('kanban.projects.show');

    Route::get('/projects/{project}/edit', [KanbanProjectController::class, 'edit'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.projects.edit');

    Route::put('/projects/{project}', [KanbanProjectController::class, 'update'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.projects.update');

    Route::patch('/projects/{project}/archive', [KanbanProjectController::class, 'archive'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.projects.archive');

    Route::patch('/projects/{project}/restore', [KanbanProjectController::class, 'restore'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.projects.restore');

    Route::delete('/projects/{project}', [KanbanProjectController::class, 'destroy'])
        ->middleware('permission:kanban.delete')
        ->name('kanban.projects.destroy');

    // Board Routes
    Route::get('/projects/{project}/boards/create', [KanbanBoardController::class, 'create'])
        ->middleware('permission:kanban.create')
        ->name('kanban.boards.create');

    Route::post('/projects/{project}/boards', [KanbanBoardController::class, 'store'])
        ->middleware('permission:kanban.create')
        ->name('kanban.boards.store');

    Route::get('/projects/{project}/boards/{board}', [KanbanBoardController::class, 'show'])
        ->middleware('permission:kanban.view')
        ->name('kanban.boards.show');

    Route::get('/projects/{project}/boards/{board}/edit', [KanbanBoardController::class, 'edit'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.boards.edit');

    Route::put('/projects/{project}/boards/{board}', [KanbanBoardController::class, 'update'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.boards.update');

    Route::delete('/projects/{project}/boards/{board}', [KanbanBoardController::class, 'destroy'])
        ->middleware('permission:kanban.delete')
        ->name('kanban.boards.destroy');

    // Column Routes
    Route::post('/projects/{project}/boards/{board}/columns', [KanbanColumnController::class, 'store'])
        ->middleware('permission:kanban.create')
        ->name('kanban.columns.store');

    Route::put('/projects/{project}/boards/{board}/columns/{column}', [KanbanColumnController::class, 'update'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.columns.update');

    Route::patch('/projects/{project}/boards/{board}/columns/order', [KanbanColumnController::class, 'updateOrder'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.columns.order');

    Route::delete('/projects/{project}/boards/{board}/columns/{column}', [KanbanColumnController::class, 'destroy'])
        ->middleware('permission:kanban.delete')
        ->name('kanban.columns.destroy');

    // Task Routes
    Route::post('/projects/{project}/boards/{board}/columns/{column}/tasks', [KanbanTaskController::class, 'store'])
        ->middleware('permission:kanban.create')
        ->name('kanban.tasks.store');

    Route::put('/projects/{project}/boards/{board}/columns/{column}/tasks/{task}', [KanbanTaskController::class, 'update'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.tasks.update');

    Route::patch('/projects/{project}/boards/{board}/tasks/move', [KanbanTaskController::class, 'move'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.tasks.move');

    Route::patch('/projects/{project}/boards/{board}/columns/{column}/tasks/order', [KanbanTaskController::class, 'updateOrder'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.tasks.order');

    Route::delete('/projects/{project}/boards/{board}/columns/{column}/tasks/{task}', [KanbanTaskController::class, 'destroy'])
        ->middleware('permission:kanban.delete')
        ->name('kanban.tasks.destroy');

    Route::delete('/projects/{project}/boards/{board}/columns/{column}/tasks/{task}/attachments', [KanbanTaskController::class, 'removeAttachment'])
        ->middleware('permission:kanban.edit')
        ->name('kanban.tasks.attachments.destroy');
});
