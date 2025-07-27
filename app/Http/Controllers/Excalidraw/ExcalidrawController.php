<?php

namespace App\Http\Controllers\Excalidraw;

use App\Http\Controllers\Controller;
use App\Models\ExcalidrawSketch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExcalidrawController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ExcalidrawSketch::latest();

        // --- START Perbaikan Pencarian ---
        if ($search = $request->get('search')) {
            $query->where('name', 'like', '%' . $search . '%');
        }
        // --- END Perbaikan Pencarian ---

        $sketches = $query->paginate(10); // Example pagination

        return Inertia::render('excalidraw/index', [
            'sketches' => $sketches,
            'search' => $request->get('search', ''), // Pastikan nilai pencarian dikembalikan ke frontend
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('excalidraw/editor');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'data' => 'nullable|json', // Store Excalidraw JSON data
        ]);

        ExcalidrawSketch::create([
            'name' => $request->name,
            'data' => $request->data,
            'user_id' => auth()->id(), // Associate with logged-in user
        ]);

        return redirect()->route('excalidraw.index')->with('success', 'Sketch saved successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ExcalidrawSketch $excalidrawSketch)
    {
        return Inertia::render('excalidraw/editor', [
            'sketch' => $excalidrawSketch,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ExcalidrawSketch $excalidrawSketch)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'data' => 'nullable|json',
        ]);

        $excalidrawSketch->update([
            'name' => $request->name,
            'data' => $request->data,
        ]);

        return redirect()->route('excalidraw.index')->with('success', 'Sketch updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExcalidrawSketch $excalidrawSketch)
    {
        $excalidrawSketch->delete();
        return redirect()->route('excalidraw.index')->with('success', 'Sketch deleted successfully.');
    }
}
