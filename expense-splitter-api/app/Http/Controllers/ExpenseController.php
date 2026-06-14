<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use App\Models\ExpenseSplit;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ExpenseController extends Controller
{
    public function index(Group $group){
        $expenses = $group->expenses;

        $response = [];
        foreach($expenses as $expense){
            $response[] = new ExpenseResource($expense);
        }

        return $response;
    }

    public function show(Request $request, Expense $expense){
        $belongs = $request->user()->groups->contains($expense->group_id);

        if(!$belongs){
            return response()->json([
                'message' => "This expense group doesn't belong to the authenticated user"
            ], 403);
        }

        $expense->load(['user', 'group']);

        return response()->json([
            'expense' => new ExpenseResource($expense)
        ]);
    }

    public function store(Request $request, Group $group){
        $belongs = $request->user()->groups->contains($group->id);

        if(!$belongs){
            return response()->json([
                'message' => "This group doesn't belong to the authenticated user"
            ], 403); 
        }

        $formFields = $request->validate([
            'category' => ['required', 'min:3', 'max:10'],
            'description' => ['required', 'min:5', 'max:255'],
            'amount' => ['required', 'decimal:1,2'],
            'member_ids' => ['required', 'array'],
            'member_ids.*' => Rule::exists(User::class, 'id')
        ]);

        $formFields['group_id'] = $group->id;
        $formFields['payer_id'] = $request->user()->id;
        $member_ids = $formFields['member_ids'];
        $amount = $formFields['amount'];
        // member_ids isn't a column in expenses table , so we should extract it before creating
        unset($formFields['member_ids']);

        $groupMemberIds = $group->users->pluck('id')->toArray();
        $invalidMembers = array_diff($member_ids, $groupMemberIds);

        if(!empty($invalidMembers)){
            return response()->json([
                'message' => "Some members do not belong to this group",
                'invalid_member_ids' => $invalidMembers
            ], 422); 
        }

        $expense = Expense::create($formFields);

        $share_amount = $amount / count($member_ids);

        foreach($member_ids as $member_id){
            ExpenseSplit::create([
                'expense_id' => $expense->id,
                'user_id' => $member_id,
                'share_amount' => $share_amount,
                'is_paid' => $member_id === $expense->payer_id
            ]);
        }

        $response = new ExpenseResource($expense);

        return response()->json([
            'expense' => $response,
            'message' => 'expense and splits have been created successfully'    
        ]); 
    }

    public function update(Request $request, Expense $expense){
        $isPayer = $request->user()->id === $expense->payer_id;

        if(!$isPayer){
            return response()->json([
                'message' => "Only the payer can update the expense"
            ], 403); 
        }

        $formFields = $request->validate([
            'category' => ['min:3', 'max:255'],
            'description' => ['min:5'],
            'amount' => ['decimal:1,2'],
            'member_ids' => ['required', 'array'],
            'member_ids.*' => Rule::exists(User::class, 'id')
        ]);

        $amount = $formFields['amount'];
        $member_ids = $formFields['member_ids'];
        $group = $expense->group;
        unset($formFields['member_ids']);

        $groupMemberIds = $group->users->pluck('id')->toArray();
        $invalidMembers = array_diff($member_ids, $groupMemberIds);

        if(!empty($invalidMembers)){
            return response()->json([
                'message' => "Some members do not belong to this group",
                'invalid_member_ids' => $invalidMembers
            ], 422); 
        }

        $expense->update($formFields);

        // Store ids of users who already paid their splits before deleting splits
        $alreadyPaidUserIds = $expense->expenseSplits()
        ->where('is_paid', true)
        ->pluck('user_id')
        ->toArray();

        // Delete the expense splits records before recreating them
        $expense->expenseSplits()->delete();

        $share_amount = $amount / count($member_ids);

        foreach($member_ids as $member_id){
            ExpenseSplit::create([
                'expense_id' => $expense->id,
                'user_id' => $member_id,
                'share_amount' => $share_amount,
                // is_paid true for the payer and every member has already paid his split 
                'is_paid' => in_array($member_id, $alreadyPaidUserIds) || $member_id === $expense->payer_id
            ]);
        }

        $response = new ExpenseResource($expense);

        return response()->json([
            'expense' => $response,
            'message' => 'Expense and splits have been updated successfully'
        ]);
    }

    public function destroy(Request $request, Expense $expense){
        $isPayer = $request->user()->id === $expense->payer_id;

        if(!$isPayer){
            return response()->json([
                'message' => "Only the payer can delete the expense"
            ], 403); 
        }

        $expense->delete();

        return response()->json([
            'expense' => $expense,
            'message' => 'expense and splits have been deleted permanently'
        ]);
    }
}
