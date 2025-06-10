<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SubcategoryController;
use App\Http\Controllers\SubsubcategoryController;
use App\Http\Controllers\BookController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public category routes (if you want them public)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/subcategories', [SubcategoryController::class, 'index']);
Route::get('/subsubcategories', [SubsubcategoryController::class, 'index']);
Route::get('categories/{category}/subcategories', [SubcategoryController::class, 'getByCategory']);
Route::get('subcategories/{subcategory}/subsubcategories', [SubsubcategoryController::class, 'getBySubcategory']);

// Public book viewing routes (if you want them public)
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book}', [BookController::class, 'show']);
Route::get('categories/{categoryId}/books', [BookController::class, 'byCategory']);
Route::get('subcategories/{subcategoryId}/books', [BookController::class, 'bySubcategory']);
Route::get('subsubcategories/{subsubcategoryId}/books', [BookController::class, 'bySubsubcategory']);
Route::get('owners/{owner_id}/books', [BookController::class, 'byOwner']);

// Protected Routes (Require Authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Logout Route
    Route::post('/logout', [AuthController::class, 'logout']);

    // Protected Category Routes
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    Route::post('/subcategories', [SubcategoryController::class, 'store']);
    Route::put('/subcategories/{id}', [SubcategoryController::class, 'update']);
    Route::delete('/subcategories/{id}', [SubcategoryController::class, 'destroy']);

    Route::post('/subsubcategories', [SubsubcategoryController::class, 'store']);
    Route::put('/subsubcategories/{id}', [SubsubcategoryController::class, 'update']);
    Route::delete('/subsubcategories/{id}', [SubsubcategoryController::class, 'destroy']);

    // Protected Book Routes (CREATE, UPDATE, DELETE require auth)
    Route::post('/books', [BookController::class, 'store']);
    Route::put('/books/{book}', [BookController::class, 'update']);
    Route::patch('/books/{book}', [BookController::class, 'update']);
    Route::delete('/books/{book}', [BookController::class, 'destroy']);

    // Messaging API Routes
    Route::prefix('messages')->group(function () {
        Route::get('/', [\App\Http\Controllers\API\MessageApiController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\API\MessageApiController::class, 'store']);
        Route::post('/create-conversation', [\App\Http\Controllers\API\MessageApiController::class, 'createConversationByEmail']);
        Route::get('/conversation/{userId}', [\App\Http\Controllers\API\MessageApiController::class, 'getConversation']);
        Route::post('/read/{userId}', [\App\Http\Controllers\API\MessageApiController::class, 'markAsRead']);
        Route::get('/conversations', [\App\Http\Controllers\API\MessageApiController::class, 'getConversationsList']);
        Route::get('/unread/count', [\App\Http\Controllers\API\MessageApiController::class, 'getUnreadCount']);
        Route::get('/{message}', [\App\Http\Controllers\API\MessageApiController::class, 'show']);
        Route::put('/{message}', [\App\Http\Controllers\API\MessageApiController::class, 'update']);
        Route::delete('/{message}', [\App\Http\Controllers\API\MessageApiController::class, 'destroy']);
    });

    // Get authenticated user info
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
    Route::get('/user/email/{email}', [UserController::class, 'getByEmail']);

    // Admin-only Routes
    Route::get('/admin/users', [UserController::class, 'getUsers']);
    Route::get('/admin/users/{userId}', [UserController::class, 'getUserDetails']);
    Route::put('/admin/users/{userId}/status', [UserController::class, 'updateStatus']);
});
