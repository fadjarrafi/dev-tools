<?php

namespace App\Http\Controllers\Note;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    /**
     * Display the notes interface.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('notes.view');

        $search = $request->get('search');
        $notesQuery = Note::forUser(auth()->id())
            ->orderBy('updated_at', 'desc');

        if ($search) {
            $notesQuery->search($search);
        }

        $notes = $notesQuery->get([
            'id',
            'title',
            'content',
            'created_at',
            'updated_at'
        ]);

        return Inertia::render('note/index', [
            'notes' => $notes,
            'search' => $search,
        ]);
    }

    /**
     * Store a new note.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('notes.create');

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        Note::create([
            'title' => $request->title,
            'content' => $request->content,
            'user_id' => auth()->id(),
        ]);

        return redirect()->back()
            ->with('success', 'Note saved successfully.');
    }

    /**
     * Update an existing note.
     */
    public function update(Request $request, Note $note): RedirectResponse
    {
        Gate::authorize('notes.edit');

        // Ensure user owns the note
        if ($note->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to note.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $note->update([
            'title' => $request->title,
            'content' => $request->content,
        ]);

        return redirect()->back()
            ->with('success', 'Note updated successfully.');
    }

    /**
     * Delete a note.
     */
    public function destroy(Note $note): RedirectResponse
    {
        Gate::authorize('notes.delete');

        // Ensure user owns the note
        if ($note->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to note.');
        }

        $note->delete();

        return redirect()->back()
            ->with('success', 'Note deleted successfully.');
    }
}
