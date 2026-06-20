<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ExpenseSplitController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/users/search', [UserController::class, 'search']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    Route::get('/groups', [GroupController::class, 'index']);
    Route::get('/groups/{group}', [GroupController::class, 'show']);
    Route::post('/groups', [GroupController::class, 'store']);
    Route::put('/groups/{group}', [GroupController::class, 'update']);
    Route::delete('/groups/{group}', [GroupController::class, 'destroy']);
    
    Route::post('/groups/{group}/members', [GroupController::class, 'addMember']);
    Route::delete('/groups/{group}/members/{user}', [GroupController::class, 'removeMember']);

    Route::post('/groups/{group}/expenses', [ExpenseController::class, 'store']);
    Route::get('/groups/{group}/expenses', [ExpenseController::class, 'index']);
    Route::get('/expenses/{expense}', [ExpenseController::class, 'show']);
    Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);
    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);
    
    Route::get('/expenses/{expense}/splits', [ExpenseSplitController::class, 'index']);
    Route::put('/expense_splits/{expenseSplit}', [ExpenseSplitController::class, 'update']);
});