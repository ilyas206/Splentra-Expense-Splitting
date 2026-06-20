<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

        public function update(Request $request, User $user){
            $canEdit = $request->user()->id === $user->id;

            if(!$canEdit){
                return response()->json([
                    'message' => "The account can ONLY be edited by its owner."
                ], 403); 
            }

            $hashedPassword = $user->password;
            $recievedPassword = $request->current_password;

            if(Hash::check($recievedPassword, $hashedPassword)){
                $formFields = $request->validate([
                    'name' => ['nullable', 'max:25'],
                    'email' => ['nullable', Rule::unique('users')->ignore($user->id)],
                    'password' => ['nullable', 'max:30', 'confirmed'],
                ]);

                // if the user doesn't update the password the field won't be sent to the DB at all 
                // otherwise it will be hashed and stored
                if(!isset($formFields['password']) || $formFields['password'] == null){
                    unset($formFields['password']); 
                } else {
                    $formFields['password'] = Hash::make($formFields['password']);
                }

                // before updating , make sure there are no null values that will overwrite the existing data
                $formFields = array_filter($formFields, fn($value) => !is_null($value));
                $user->update($formFields);

                return response()->json([
                    'user' => $user,
                    'message' => 'Your account info have been updated successfully'
                ]);
            }else{
                return response()->json([
                    'message' => 'The password you entered is incorrect'
                ], 403);
            }
    }

    public function destroy(Request $request, User $user){
        $canDelete = $request->user()->id === $user->id;

        if(!$canDelete){
            return response()->json([
                'message' => "The account can ONLY be deleted by its owner."
            ], 403); 
        }

        // find expenses where this user is a member but NOT the payer
        // (expenses where they ARE the payer will cascade-delete automatically)
        $affectedExpenses = Expense::where('payer_id', '!=', $user->id)
            ->whereHas('expenseSplits', function($query) use ($user){
                $query->where('user_id', $user->id);
            })->get();

        foreach($affectedExpenses as $expense){
            // check if the leaving member's split was already paid BEFORE deleting it
            $leavingSplit = $expense->expenseSplits()->where('user_id', $user->id)->first();
            $wasAlreadyPaid = $leavingSplit?->is_paid ?? false;

            // remove this user's split
            $expense->expenseSplits()->where('user_id', $user->id)->delete();

            // recalculate remaining splits
            $remainingSplits = $expense->expenseSplits()->get();

            if($remainingSplits->count() <= 1){
                // only the payer is left (or none) — expense no longer makes sense as a split
                $expense->delete();
                continue;
            }

            // if the leaving member already paid, their debt is settled — no redistribution needed
            if($wasAlreadyPaid){
                continue;
            }

            $newShareAmount = $expense->amount / $remainingSplits->count();

            foreach($remainingSplits as $split){
                $split->update(['share_amount' => $newShareAmount]);
            }
        }

        // handle groups where this user is the creator
        $ownedGroups = Group::where('created_by', $user->id)->get();

        foreach($ownedGroups as $group){
            // find the oldest remaining member (excluding the user being deleted)
            $newOwner = $group->users()
                ->where('users.id', '!=', $user->id)
                ->orderBy('group_user.created_at', 'asc')
                ->first();

            if($newOwner){
                // transfer ownership to the oldest remaining member
                $group->update(['created_by' => $newOwner->id]);
            } else {
                // no other members left, the group no longer makes sense
                $group->delete();
            }
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'user' => $user,
            'message' => 'user account has been deleted permanently'
        ]);
    }
}
