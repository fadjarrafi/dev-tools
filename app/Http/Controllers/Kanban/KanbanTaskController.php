<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Models\KanbanBoard;
use App\Models\KanbanColumn;
use App\Models\KanbanProject;
use App\Models\KanbanTask;
use App\Models\KanbanTaskAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB; // Ensure DB facade is imported
use Illuminate\Support\Str;

class KanbanTaskController extends Controller
{
    /**
     * Store a newly created task in storage.
     */
    public function store(Request $request, KanbanProject $project, KanbanBoard $board, KanbanColumn $column): RedirectResponse
    {
        Gate::authorize('kanban.create');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'priority' => 'required|in:Low,Medium,High,Critical',
            'tags' => 'nullable|string|max:500',
            'due_date' => 'nullable|date|after_or_equal:today',
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,gif,webp|max:3072', // 3MB max
        ]);

        $maxSortOrder = $column->tasks()->max('sort_order') ?? 0;

        $tags = null;
        if (!empty($validated['tags'])) {
            $tags = array_map('trim', explode(',', $validated['tags']));
            $tags = array_filter($tags);
        }

        $task = $column->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'tags' => $tags,
            'due_date' => $validated['due_date'],
            'sort_order' => $maxSortOrder + 1,
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $this->storeAttachment($task, $file);
            }
        }

        return redirect()->route('kanban.boards.show', [$project, $board])
            ->with('success', 'Task created successfully.');
    }

    /**
     * Update the specified task in storage.
     */
    public function update(Request $request, KanbanProject $project, KanbanBoard $board, KanbanColumn $column, KanbanTask $task): RedirectResponse
    {
        Gate::authorize('kanban.edit');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'priority' => 'required|in:Low,Medium,High,Critical',
            'tags' => 'nullable|string|max:500',
            'due_date' => 'nullable|date',
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,gif,webp|max:3072', // 3MB max
        ]);

        $tags = null;
        if (!empty($validated['tags'])) {
            $tags = array_map('trim', explode(',', $validated['tags']));
            $tags = array_filter($tags);
        }

        $task->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'tags' => $tags,
            'due_date' => $validated['due_date'],
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $this->storeAttachment($task, $file);
            }
        }

        return redirect()->route('kanban.boards.show', [$project, $board])
            ->with('success', 'Task updated successfully.');
    }

    /**
     * Move task to different column and/or update order.
     */
    public function move(Request $request, KanbanProject $project, KanbanBoard $board): RedirectResponse
    {
        Gate::authorize('kanban.edit');

        $validated = $request->validate([
            'task_id' => 'required|exists:kanban_tasks,id',
            'column_id' => 'required|exists:kanban_columns,id',
            'sort_order' => 'required|integer|min:0',
        ]);

        $task = KanbanTask::findOrFail($validated['task_id']);
        $newColumn = KanbanColumn::findOrFail($validated['column_id']);

        // Verify the column belongs to the current board
        if ($newColumn->board_id !== $board->id) {
            return redirect()->route('kanban.boards.show', [$project, $board])
                ->with('error', 'Invalid column for this board.');
        }

        // Update task column and sort order
        $task->update([
            'column_id' => $validated['column_id'],
            'sort_order' => $validated['sort_order'],
        ]);

        return redirect()->route('kanban.boards.show', [$project, $board])
            ->with('success', 'Task moved successfully.');
    }

    /**
     * Update task order within the same column.
     */
    public function updateOrder(Request $request, KanbanProject $project, KanbanBoard $board, KanbanColumn $column): RedirectResponse
    {
        Gate::authorize('kanban.edit');

        $validated = $request->validate([
            'tasks' => 'required|array',
            'tasks.*.id' => 'required|exists:kanban_tasks,id',
            'tasks.*.sort_order' => 'required|integer|min:0',
        ]);

        // Verify column belongs to the board
        if ($column->board_id !== $board->id) {
            return redirect()->route('kanban.boards.show', [$project, $board])
                ->with('error', 'Invalid column for this board.');
        }

        // Verify all tasks belong to the specified column
        $taskIds = collect($validated['tasks'])->pluck('id');
        $validTaskCount = KanbanTask::where('column_id', $column->id)
            ->whereIn('id', $taskIds)
            ->count();

        if ($validTaskCount !== count($taskIds)) {
            return redirect()->route('kanban.boards.show', [$project, $board])
                ->with('error', 'Some tasks do not belong to this column.');
        }

        // Update task orders in a transaction for data consistency
        DB::transaction(function () use ($validated, $column) {
            foreach ($validated['tasks'] as $taskData) {
                KanbanTask::where('id', $taskData['id'])
                    ->where('column_id', $column->id) // Ensure task belongs to this column
                    ->update(['sort_order' => $taskData['sort_order']]);
            }
        });

        return redirect()->route('kanban.boards.show', [$project, $board])
            ->with('success', 'Task order updated successfully.');
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(KanbanProject $project, KanbanBoard $board, KanbanColumn $column, KanbanTask $task): RedirectResponse
    {
        Gate::authorize('kanban.delete');

        $task->delete(); // This will also delete attachments via model events

        return redirect()->route('kanban.boards.show', [$project, $board])
            ->with('success', 'Task deleted successfully.');
    }

    /**
     * Remove attachment from task.
     */
    public function removeAttachment(Request $request, KanbanProject $project, KanbanBoard $board, KanbanColumn $column, KanbanTask $task): RedirectResponse
    {
        Gate::authorize('kanban.edit');

        $validated = $request->validate([
            'attachment_id' => 'required|exists:kanban_task_attachments,id',
        ]);

        $attachment = KanbanTaskAttachment::where('id', $validated['attachment_id'])
            ->where('task_id', $task->id)
            ->firstOrFail();

        $attachment->delete(); // This will also delete the file via model events

        return redirect()->route('kanban.boards.show', [$project, $board])
            ->with('success', 'Attachment removed successfully.');
    }

    /**
     * Store an attachment for a task.
     */
    private function storeAttachment(KanbanTask $task, $file): KanbanTaskAttachment
    {
        $filename = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $storedName = Str::uuid() . '.' . $extension;
        $path = $file->storeAs('kanban', $storedName, 'public');

        return $task->attachments()->create([
            'filename' => $filename,
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
    }
}
