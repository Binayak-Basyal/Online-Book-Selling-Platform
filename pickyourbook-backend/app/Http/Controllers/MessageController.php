<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = request()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }
        
        $userId = $user->id;
        
        // Get messages where current user is sender or receiver
        $messages = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->orderBy('created_at', 'desc')
            ->with(['sender', 'receiver'])
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = request()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }
        
        $users = User::where('id', '!=', $user->id)->get();
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = request()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }
        
        $request->validate([
            'message' => 'required|string',
            'receiver_id' => 'required|exists:users,id'
        ]);
        
        $message = Message::create([
            'message' => $request->message,
            'seen' => 0,  // Use integer 0 for unseen
            'sender_id' => $user->id,
            'receiver_id' => $request->receiver_id
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => $message->load(['sender', 'receiver'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Message $message)
    {
        $user = request()->user();
        if (!$user || ($user->id != $message->sender_id && $user->id != $message->receiver_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }
        
        // Mark as seen if viewing as receiver
        if ($user->id == $message->receiver_id && $message->seen == 0) {
            $message->update(['seen' => 1]);
        }
        
        return response()->json([
            'success' => true,
            'data' => $message->load(['sender', 'receiver'])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Message $message)
    {
        $user = request()->user();
        if (!$user || $user->id != $message->sender_id || $message->seen == 1) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action'
            ], 403);
        }
        
        return response()->json([
            'success' => true,
            'data' => $message->load(['sender', 'receiver'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Message $message)
    {
        $user = request()->user();
        if (!$user || $user->id != $message->sender_id || $message->seen == 1) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action'
            ], 403);
        }
        
        $request->validate([
            'message' => 'required|string'
        ]);
        
        $message->update([
            'message' => $request->message
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Message updated successfully',
            'data' => $message->load(['sender', 'receiver'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message)
    {
        $user = request()->user();
        if (!$user || ($user->id != $message->sender_id && $user->id != $message->receiver_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action'
            ], 403);
        }
        
        $message->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully'
        ]);
    }
}
