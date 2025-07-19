<?php

namespace App\Http\Controllers\Tree;

use App\Http\Controllers\Controller;
use App\Models\Tree;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TreeGeneratorController extends Controller
{
    /**
     * Display the tree generator interface.
     */
    public function index()
    {
        $savedTrees = Tree::orderBy('updated_at', 'desc')->get([
            'id',
            'title',
            'content',
            'generated_tree',
            'created_at',
            'updated_at'
        ]);

        return Inertia::render('tree/index', [
            'savedTrees' => $savedTrees,
        ]);
    }

    /**
     * Store a new tree.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'generated_tree' => 'required|string',
        ]);

        Tree::create([
            'title' => $request->title,
            'content' => $request->content,
            'generated_tree' => $request->generated_tree,
        ]);

        $savedTrees = Tree::orderBy('updated_at', 'desc')->get([
            'id',
            'title',
            'content',
            'generated_tree',
            'created_at',
            'updated_at'
        ]);

        return redirect()->back()->with([
            'savedTrees' => $savedTrees,
        ]);
    }

    /**
     * Update an existing tree.
     */
    public function update(Request $request, Tree $tree)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'generated_tree' => 'required|string',
        ]);

        $tree->update([
            'title' => $request->title,
            'content' => $request->content,
            'generated_tree' => $request->generated_tree,
        ]);

        $savedTrees = Tree::orderBy('updated_at', 'desc')->get([
            'id',
            'title',
            'content',
            'generated_tree',
            'created_at',
            'updated_at'
        ]);

        return redirect()->back()->with([
            'savedTrees' => $savedTrees,
        ]);
    }

    /**
     * Delete a tree.
     */
    public function destroy(Tree $tree)
    {
        $tree->delete();

        $savedTrees = Tree::orderBy('updated_at', 'desc')->get([
            'id',
            'title',
            'content',
            'generated_tree',
            'created_at',
            'updated_at'
        ]);

        return redirect()->back()->with([
            'savedTrees' => $savedTrees,
        ]);
    }
}
