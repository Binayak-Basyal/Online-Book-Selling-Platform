<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subsubcategory;

class SubsubcategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subsubcategories = Subsubcategory::all();
        return response()->json($subsubcategories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'subsubcategory_name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'required|exists:subcategories,id',
        ]);
        $subsubcategory = Subsubcategory::create($request->only(['subsubcategory_name', 'category_id', 'subcategory_id']));
        return response()->json($subsubcategory, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $subsubcategory = Subsubcategory::findOrFail($id);
        return response()->json($subsubcategory);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'subsubcategory_name' => 'required|string|max:255',
        ]);
        $subsubcategory = Subsubcategory::findOrFail($id);
        $subsubcategory->update($request->only(['subsubcategory_name']));
        return response()->json($subsubcategory);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $subsubcategory = Subsubcategory::findOrFail($id);
        $subsubcategory->delete();
        return response()->json(['message' => 'Subsubcategory deleted successfully']);
    }
    public function getBySubcategory($subcategoryId)
    {
        $subsubcategories = Subsubcategory::where('subcategory_id', $subcategoryId)->get();
        return response()->json($subsubcategories);
    }
}
