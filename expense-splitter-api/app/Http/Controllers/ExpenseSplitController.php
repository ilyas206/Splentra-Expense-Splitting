<?php

namespace App\Http\Controllers;

use App\Models\ExpenseSplit;
use Illuminate\Http\Request;

class ExpenseSplitController extends Controller
{
    public function update(Request $request, ExpenseSplit $expenseSplit){
        $belongs = $request->user()->id === $expenseSplit->user_id;

        if(!$belongs){
            return response()->json([
                'message' => "Only the user this split belongs to can update it"
            ], 403); 
        }

        $expenseSplit->update([
            'is_paid' => true
        ]);

        return response()->json([
            'expense_split' => $expenseSplit
        ]);
    }
}
