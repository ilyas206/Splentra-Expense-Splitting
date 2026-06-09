<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request){
        $formFields = $request->validate([
            'name' => ['required', 'max:25'],
            'email' => ['required', 'unique:users', 'email'],
            'password' => ['required', 'min:6', 'max:30', 'confirmed'],
        ]);

        $formFields['password'] = Hash::make($request->password);

        $user = User::create($formFields);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user, 
            'token' => $token,
            'message' => 'User registered successfully.'
        ];
    }

    public function login(Request $request){
        $formFields = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'min:6', 'max:30'],
        ]);

        if(Auth::attempt($formFields)){
            $user = $request->user();
            $token = $user->createToken('auth_token')->plainTextToken;
            
            return [
                'user' => $user, 
                'token' => $token
            ]; 

        }else{
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }
    }

    public function user(Request $request){
        $user = $request->user();
        return response()->json([
            'user' => $user
        ]);
    }

    public function logout(Request $request){
        $user = $request->user();
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Logout successfully.'
        ]);
    }
}
