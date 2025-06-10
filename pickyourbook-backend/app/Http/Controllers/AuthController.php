<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'contact' => 'nullable|string|max:15',
            'address' => 'required|string',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|confirmed|min:8',
            'user_pic' => 'nullable|image',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Handle image upload if present
        $userPicPath = null;
        if ($request->hasFile('user_pic')) {
            $userPicPath = $request->file('user_pic')->store('user_pics', 'public');
        }

        // Create the user
        $user = User::create([
            'full_name' => $request->full_name,
            'contact' => $request->contact,
            'address' => $request->address,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_pic' => $userPicPath,
        ]);

        return response()->json(['message' => 'User registered successfully'], 201);
    }

    /**
     * Login user and return a token.
     */
    public function login(Request $request)
    {
        // Validate login data
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Attempt authentication
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = Auth::user();

        // Check user status
        if ($user->status == 0) {
            return response()->json(['message' => 'Your account is pending approval.'], 403);
        }

        if ($user->status == 2) {
            return response()->json(['message' => 'Your account has been rejected.'], 403);
        }

        // Status is 1 (approved), create token
        $token = $user->createToken('YourAppName')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Logout user and revoke all tokens.
     */
    public function logout(Request $request)
    {
        $user = $request->user(); // Prefer this to Auth::user()
        $user->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
