<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Models\KanbanBoard;
use App\Models\KanbanColumn;
use App\Models\KanbanProject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class KanbanColumnController extends Controller
{
    /**
     * Store a newly created column in storage.
     */
    public function store(Request $request, KanbanProject $project, KanbanBoard $board): RedirectResponse
    {
        Gate::authorize('kanban.create');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7', // Hex color code
        ]);

        // Get the next sort order
        $maxSortOrder = $board->columns()->max('sort_order') ?? 0;

        $board->columns()->create([
            'name' => $validated['name'],
            'color' => $validated['color'],
            'sort_order' => $maxSortOrder + 1,
        ]);

        return redirect()->route('kanban.boards.show', [$project, $board])
            ->with('success', 'Column created successfully.');
    }

    /**
     * Update the specified column in storage.
     */
    public function update(Request $request, KanbanProject $project, KanbanBoard $board, KanbanColumn $column): RedirectResponse
    {
        Gate::authorize('kanban.edit');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7', // Hex color code
        ]);

        $column->update($validated);

        return redirect()->route('kanban.boards.show', [$project, $board])
            ->with('success', 'Column updated successfully.');
    }

    /**
     * Update column order (for drag and drop).
     */
    public function updateOrder(Request $request, KanbanProject $project, KanbanBoard $board): JsonResponse
    {
        Gate::authorize('kanban.edit');

        $validated = $request->validate([
            'columns' => 'required|array',
            'columns.*.id' => 'required|exists:kanban_columns,id',
            'columns.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['columns'] as $columnData) {
            KanbanColumn::where('id', $columnData['id'])
                ->where('board_id', $board->id)
                ->update(['sort_order' => $columnData['sort_order']]);
        }

        return response()->json(['message' => 'Column order updated successfully.']);
    }

    /**
     * Remove the specified column from storage.
     */
    public function destroy(KanbanProject $project, KanbanBoard $board, KanbanColumn $column): RedirectResponse
    {
        Gate::authorize('kanban.delete');

        // Check if column has tasks
        if ($column->tasks()->count() > 0) {
            return redirect()->route('kanban.boards.show', [$project, $board])
                ->with('error', 'Cannot delete column that contains tasks. Please move or delete all tasks first.');
        }

        $column->delete();

        return redirect()->route('kanban.boards.show', [$project, $board])
            ->with('success', 'Column deleted successfully.');
    }
}
