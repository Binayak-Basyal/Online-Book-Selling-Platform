<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Book::query();

        // Fetch all details of books according to the owner_email if provided
        if ($request->has('owner_email')) {
            $query->where('owner_email', $request->owner_email);
        }

        $books = $query->with('owner:id,full_name,email')->get(); // Specify the fields

        return response()->json($books);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'book_name' => 'required|string|max:255',
            'book_author' => 'required|string|max:255',
            'book_publication' => 'required|string|max:255',
            'book_isbn' => 'required|string|max:20',
            'book_condition' => 'required|in:new,used',
            'book_price' => 'required|numeric|min:0',
            'book_image' => 'required|file|image|max:2048',
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'subsubcategory_id' => 'nullable|exists:subsubcategories,id',
        ]);

        $bookData = $request->except('book_image');

        // Check if user is authenticated
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated. Please login first.'], 401);
        }

        // Now safely access user properties
        $bookData['owner_id'] = $user->id;
        $bookData['owner_email'] = $user->email;

        if ($request->hasFile('book_image')) {
            try {
                $path = $request->file('book_image')->store('book-images', 'public');
                $bookData['book_image'] = $path;
            } catch (\Exception $e) {
                Log::error('Image upload failed: ' . $e->getMessage());
                return response()->json(['error' => 'Image upload failed: ' . $e->getMessage()], 500);
            }
        }

        $book = Book::create($bookData);
        return response()->json($book);
    }

    /**
     * Display the specified resource.
     */
    public function show(Book $book)
    {
        $book->load('owner:id,full_name,email'); // Eager load owner with specific fields
    return response()->json($book);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Book $book)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Book $book)
    {
        $request->validate([
            'book_name' => 'sometimes|string|max:255',
            'book_author' => 'sometimes|string|max:255',
            'book_publication' => 'sometimes|string|max:255',
            'book_isbn' => 'sometimes|string|max:20',
            'book_condition' => 'sometimes|in:new,used',
            'book_price' => 'sometimes|numeric|min:0',
            'book_image' => 'nullable|image|max:2048',
            'category_id' => 'sometimes|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'subsubcategory_id' => 'nullable|exists:subsubcategories,id',
            // Remove 'owner_email' validation as we'll use the authenticated user
        ]);

        $bookData = $request->except('book_image');

        // Set both owner_id and owner_email from the authenticated user
        $user = $request->user();
        $bookData['owner_id'] = $user->id;
        $bookData['owner_email'] = $user->email;

        if ($request->hasFile('book_image')) {
            try {
                $path = $request->file('book_image')->store('book-images', 'public');
                $bookData['book_image'] = $path;
            } catch (\Exception $e) {
                Log::error('Image upload failed: ' . $e->getMessage());
                return response()->json(['error' => 'Image upload failed: ' . $e->getMessage()], 500);
            }
        }

        $book->update($bookData);
        return response()->json($book);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book)
    {
        $book->delete();
        return response()->json(['message' => 'Book deleted successfully']);
    }

    /**
     * Get books by category.
     */
    public function byCategory($categoryId)
    {
        $books = Book::where('category_id', $categoryId)
            ->with('owner:id,full_name,email')  // Specify the fields
            ->get();
        return response()->json($books);
    }

    public function bySubcategory($subcategoryId)
    {
        $books = Book::where('subcategory_id', $subcategoryId)
            ->with('owner:id,full_name,email')  // Specify the fields
            ->get();
        return response()->json($books);
    }

    public function bySubsubcategory($subsubcategoryId)
    {
        $books = Book::where('subsubcategory_id', $subsubcategoryId)
            ->with('owner:id,full_name,email')  // Specify the fields
            ->get();
        return response()->json($books);
    }

    public function byOwner($email)
    {
        $books = Book::where('owner_email', $email)
            ->with('owner:id,full_name,email')  // Specify the fields
            ->get();
        return response()->json($books);
    }
}
