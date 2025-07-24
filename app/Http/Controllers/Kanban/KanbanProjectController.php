<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Models\KanbanProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class KanbanProjectController extends Controller
{
    /**
     * Display a listing of kanban projects.
     */
    public function index(): Response
    {
        Gate::authorize('kanban.view');

        $activeProjects = KanbanProject::active()
            ->with(['boards' => function ($query) {
                $query->latest();
            }])
            ->latest()
            ->get();

        $archivedProjects = KanbanProject::archived()
            ->latest()
            ->get();

        return Inertia::render('kanban/projects/index', [
            'activeProjects' => $activeProjects,
            'archivedProjects' => $archivedProjects,
        ]);
    }

    /**
     * Show the form for creating a new project.
     */
    public function create(): Response
    {
        Gate::authorize('kanban.create');

        return Inertia::render('kanban/projects/create');
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('kanban.create');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        KanbanProject::create($validated);

        return redirect()->route('kanban.projects.index')
            ->with('success', 'Project created successfully.');
    }

    /**
     * Display the specified project.
     */
    public function show(KanbanProject $project): Response
    {
        Gate::authorize('kanban.view');

        $project->load(['boards' => function ($query) {
            $query->latest();
        }]);

        return Inertia::render('kanban/projects/show', [
            'project' => $project,
        ]);
    }

    /**
     * Show the form for editing the specified project.
     */
    public function edit(KanbanProject $project): Response
    {
        Gate::authorize('kanban.edit');

        return Inertia::render('kanban/projects/edit', [
            'project' => $project,
        ]);
    }

    /**
     * Update the specified project in storage.
     */
    public function update(Request $request, KanbanProject $project): RedirectResponse
    {
        Gate::authorize('kanban.edit');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $project->update($validated);

        return redirect()->route('kanban.projects.index')
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Archive the specified project.
     */
    public function archive(KanbanProject $project): RedirectResponse
    {
        Gate::authorize('kanban.edit');

        $project->update(['is_archived' => true]);

        return redirect()->route('kanban.projects.index')
            ->with('success', 'Project archived successfully.');
    }

    /**
     * Restore the specified project from archive.
     */
    public function restore(KanbanProject $project): RedirectResponse
    {
        Gate::authorize('kanban.edit');

        $project->update(['is_archived' => false]);

        return redirect()->route('kanban.projects.index')
            ->with('success', 'Project restored successfully.');
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(KanbanProject $project): RedirectResponse
    {
        Gate::authorize('kanban.delete');

        $project->delete();

        return redirect()->route('kanban.projects.index')
            ->with('success', 'Project deleted successfully.');
    }
}
