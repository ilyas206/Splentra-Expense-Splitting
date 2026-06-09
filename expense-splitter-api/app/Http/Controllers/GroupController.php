<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExpenseResource;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GroupController extends Controller
{
    public function index(Request $request){
        $groups = $request->user()->groups;

        $response = [];
        foreach($groups as $group){
            $response[] = new GroupResource($group);
        }

        return $response;
    }

    // show action returns the selected group only if it belongs to the authenticated user
    public function show(Request $request, Group $group){
        $belongs = $request->user()->groups->contains($group->id);

        if(!$belongs){
            return response()->json([
                'message' => "This group doesn't belong to the authenticated user"
            ], 403);
        }

        $group->load(['creator', 'users', 'expenses']);

        $expenses = $group->expenses;

        $response = [];
        foreach($expenses as $expense){
            $response[] = new ExpenseResource($expense);
        }

        return response()->json([
            'group' => new GroupResource($group),
            'expenses' => $response
        ]);
    }

    public function store(Request $request){
        $formFields = $request->validate([
            'title' => ['required', 'max:30']
        ]); 

        $formFields['created_by'] = $request->user()->id;

        $group = Group::create($formFields);
        $group->users()->attach($request->user()->id);

        $response = new GroupResource($group);

        return response()->json([
            'group' => $response,
            'message' => '"' . $group->title . '" Group has been created successfully'
        ]);
    }

    // only the group creator CAN update or delete or add members to the selected group 
    public function update(Request $request, Group $group){
        $created = $request->user()->id === $group->created_by;

        if(!$created){
            return response()->json([
                'title' => "You CANNOT Update This Group",
                'description' => "Someone else has created this group . Try contacting the creator."
            ], 403);
        }

        $formFields = $request->validate([
            'title' => ['required', 'max:30']
        ]); 

        $group->update($formFields);

        $response = new GroupResource($group);

        return response()->json([
            'group' => $response,
            'message' => '"' . $group->title . '" Group has been updated successfully'
        ]);
    }

    public function destroy(Request $request, Group $group){
        $created = $request->user()->id === $group->created_by;

        if(!$created){
            return response()->json([
                'title' => "You CANNOT Delete This Group",
                'description' => "Someone else has created this group . Try contacting the creator."
            ], 403);
        }

        $group->delete();

        return response()->json([
            'message' => '"' . $group->title . '" Group has been deleted permanently'
        ]);
    }

    public function addMember(Request $request, Group $group){
        $isCreator = $request->user()->id === $group->created_by;

        if(!$isCreator){
            return response()->json([
                'message' => 'Only the group creator can add members'
            ], 403);
        }

        $formFields = $request->validate([
            'user_id' => Rule::exists(User::class, 'id')
        ]);

        $group->users()->syncWithoutDetaching($formFields['user_id']);

        $newMember = User::find($formFields['user_id']);

        return response()->json([
            'newMember' => $newMember,
            'message' => 'Member has been added successfully'
        ]);
    }

    public function removeMember(Request $request, Group $group, User $user){
        $isCreator = $request->user()->id === $group->created_by;

        if(!$isCreator){
            return response()->json([
                'message' => 'Only the group creator can remove members'
            ], 403);
        }

        $group->users()->detach($user->id);

        return response()->json([
            'message' => 'Member has been removed successfully'
        ]);
    }
}
