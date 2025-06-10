<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageApiController extends Controller
{

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
public function createConversationByEmail(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized access'
        ], 401);
    }

    $request->validate([
        'email' => 'required|email|exists:users,email'
    ]);

    $otherUser = \App\Models\User::where('email', $request->email)->first();
    if (!$otherUser) {
        return response()->json([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    }

    // Optionally: check if a conversation already exists (skip if not needed)
    // No message is created here, just return the user info
    return response()->json([
        'success' => true,
        'data' => $otherUser
    ]);
}

    public function store(Request $request): \Illuminate\Http\JsonResponse
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
            'seen' => 0,  // Use integer 0
            'sender_id' => $user->id,
            'receiver_id' => $request->receiver_id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => $message->load(['sender', 'receiver'])
        ], 201);
    }
    public function show(Message $message): \Illuminate\Http\JsonResponse
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
     * Update the specified message
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Message $message
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Message $message)
    {
        $user = request()->user();
        if (!$user || $user->id != $message->sender_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        if ($message->seen == '1') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update a seen message'
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

    public function destroy(Message $message)
    {
        $user = request()->user();
        if (!$user || ($user->id != $message->sender_id && $user->id != $message->receiver_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully'
        ]);
    }
    public function getConversation($userId)
    {
        $user = request()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }

        // Check if other user exists
        $otherUser = User::find($userId);
        if (!$otherUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $currentUserId = $user->id;

        $messages = Message::where(function($query) use ($currentUserId, $userId) {
            $query->where('sender_id', $currentUserId)
                  ->where('receiver_id', $userId);
        })->orWhere(function($query) use ($currentUserId, $userId) {
            $query->where('sender_id', $userId)
                  ->where('receiver_id', $currentUserId);
        })
        ->with(['sender', 'receiver'])
        ->orderBy('created_at', 'asc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'messages' => $messages,
                'user' => $otherUser
            ]
        ]);
    }
    public function markAsRead($userId): \Illuminate\Http\JsonResponse
    {
        $authUser = request()->user();
        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }

        // Mark all unseen messages from $userId to authenticated user as seen
        Message::where('sender_id', $userId)
            ->where('receiver_id', $authUser->id)
            ->where('seen', 0)
            ->update(['seen' => 1]);

        return response()->json([
            'success' => true,
            'message' => 'Messages marked as read'
        ]);
    }

    public function getUnreadCount()
    {
        $user = request()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }
        $userId = $user->id;

        $unreadCount = Message::where('receiver_id', $userId)
            ->where('seen', '0')
            ->count();

        return response()->json([
            'success' => true,
            'data' => $unreadCount
        ]);
    }
    public function getConversationsList()
    {
        $user = request()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 401);
        }

        $userId = $user->id;

        // Get all users who have exchanged messages with current user
        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->select('sender_id', 'receiver_id')
            ->distinct()
            ->get()
            ->map(function ($message) use ($userId) {
                // Get the other user's ID
                $otherUserId = $message->sender_id == $userId ? $message->receiver_id : $message->sender_id;
                return $otherUserId;
            })
            ->unique()
            ->values();

        $results = [];

        foreach ($conversations as $otherUserId) {
            // Get the user
            $otherUser = User::find($otherUserId);
            if (!$otherUser) continue;

            // Get latest message
            $latestMessage = Message::where(function($query) use ($userId, $otherUserId) {
                $query->where('sender_id', $userId)
                    ->where('receiver_id', $otherUserId);
            })->orWhere(function($query) use ($userId, $otherUserId) {
                $query->where('sender_id', $otherUserId)
                    ->where('receiver_id', $userId);
            })
                ->latest()
                ->first();

            // Count unread messages
            $unreadCount = Message::where('sender_id', $otherUserId)
                ->where('receiver_id', $userId)
                ->where('seen', '0')
                ->count();

            $results[] = [
                'user' => $otherUser,
                'latest_message' => $latestMessage,
                'unread_count' => $unreadCount
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    }
}
