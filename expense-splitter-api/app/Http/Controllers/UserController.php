<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function search(Request $request){
        $query = $request->query('q');
        $user = User::where('email', $query)->first();
        if($user){
            return $user;
        }else{
            return response()->json([
                'message' => 'No user available with this email'
            ], 404);
        }
    }
}
