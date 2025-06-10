<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subcategory;

class SubcategoryController extends Controller
{
    public function index()
{
    $subcategories = Subcategory::all();
    return response()->json($subcategories);
}
    public function store(Request $request)
    {
        $request->validate([
            'subcategory_name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
        ]);
        $subcategory = Subcategory::create($request->only(['subcategory_name', 'category_id']));
        return response()->json($subcategory, 201);
    }

    public function show(string $id)
    {
        $subcategory = Subcategory::with('subsubcategories')->findOrFail($id);
        return response()->json($subcategory);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'subcategory_name' => 'required|string|max:255',
        ]);
        $subcategory = Subcategory::findOrFail($id);
        $subcategory->update($request->only(['subcategory_name']));
        return response()->json($subcategory);
    }

    public function destroy(string $id)
    {
        $subcategory = Subcategory::findOrFail($id);
        $subcategory->delete();
        return response()->json(['message' => 'Subcategory deleted successfully']);
    }
    public function getByCategory($categoryId)
    {
        $subcategories = Subcategory::where('category_id', $categoryId)->get();
        return response()->json($subcategories);
    }
}
