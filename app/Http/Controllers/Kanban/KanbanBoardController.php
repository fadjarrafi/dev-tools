<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Models\KanbanBoard;
use App\Models\KanbanProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class KanbanBoardController extends Controller
{
    /**
     * Display the specified board with all its columns and tasks.
     */
    public function show(KanbanProject $project, KanbanBoard $board): Response
    {
        Gate::authorize('kanban.view');

        $board->load([
            'columns' => function ($query) {
                $query->orderBy('sort_order');
            },
            'columns.tasks' => function ($query) {
                $query->orderBy('sort_order');
                // THIS IS THE CRUCIAL LINE TO ADD/MODIFY
                $query->with('column'); // Eager load the column relationship for each task
            },
            'columns.tasks.attachments' // Keep loading attachments
        ]);

        return Inertia::render('kanban/boards/show', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    /**
     * Show the form for creating a new board.
     */
    public function create(KanbanProject $project): Response
    {
        Gate::authorize('kanban.create');

        return Inertia::render('kanban/boards/create', [
            'project' => $project,
        ]);
    }

    /**
     * Store a newly created board in storage.
     */
    public function store(Request $request, KanbanProject $project): RedirectResponse
    {
        Gate::authorize('kanban.create');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $board = $project->boards()->create($validated);
        $board->createDefaultColumns();

        return redirect()->route('kanban.boards.show', [$project, $board])
            ->with('success', 'Board created successfully.');
    }

    /**
     * Show the form for editing the specified board.
     */
    public function edit(KanbanProject $project, KanbanBoard $board): Response
    {
        Gate::authorize('kanban.edit');

        return Inertia::render('kanban/boards/edit', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    /**
     * Update the specified board in storage.
     */
    public function update(Request $request, KanbanProject $project, KanbanBoard $board): RedirectResponse
    {
        Gate::authorize('kanban.edit');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $board->update($validated);

        return redirect()->route('kanban.boards.show', [$project, $board])
            ->with('success', 'Board updated successfully.');
    }

    /**
     * Remove the specified board from storage.
     */
    public function destroy(KanbanProject $project, KanbanBoard $board): RedirectResponse
    {
        Gate::authorize('kanban.delete');

        $board->delete();

        return redirect()->route('kanban.projects.show', $project)
            ->with('success', 'Board deleted successfully.');
    }
}
