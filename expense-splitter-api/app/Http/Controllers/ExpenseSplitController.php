<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseSplit;
use Illuminate\Http\Request;

class ExpenseSplitController extends Controller
{

    public function index(Request $request, Expense $expense){
        $belongs = $request->user()->groups->contains($expense->group_id);

        if(!$belongs){
            return response()->json([
                'message' => "This expense group doesn't belong to the authenticated user"
            ], 403);
        }

        $expenseSplits = $expense->expenseSplits()->with('user')->get();

        return response()->json([
            'expenseSplits' => $expenseSplits
        ]);
    }

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
            'expense_split' => $expenseSplit,
            'message' => 'Your Expense is NOW successfully Paid'
        ]);
    }
}
