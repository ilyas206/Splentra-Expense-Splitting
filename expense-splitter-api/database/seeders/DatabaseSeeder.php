<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Group;
use App\Models\Expense;
use App\Models\ExpenseSplit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // create users
        $demo = User::create([
            'name' => 'Demo',
            'email' => 'demo@splentra.com',
            'password' => Hash::make('demo1234'),
        ]);

        $ahmed = User::create([
            'name' => 'Ahmed',
            'email' => 'ahmed@splentra.com',
            'password' => Hash::make('ahmed1234'),
        ]);

        $yassine = User::create([
            'name' => 'Yassine',
            'email' => 'yassine@splentra.com',
            'password' => Hash::make('yassine1234'),
        ]);

        $ben = User::create([
            'name' => 'Ben',
            'email' => 'ben@splentra.com',
            'password' => Hash::make('ben1234'),
        ]);

        $jane = User::create([
            'name' => 'Jane',
            'email' => 'jane@splentra.com',
            'password' => Hash::make('jane1234'),
        ]);

        // create groups
        $homeGroup = Group::create([
            'title' => 'Home',
            'created_by' => $demo->id,
        ]);
        $homeGroup->users()->attach([$demo->id, $ahmed->id, $yassine->id]);

        $travelGroup = Group::create([
            'title' => 'Travel',
            'created_by' => $ben->id,
        ]);
        $travelGroup->users()->attach([$demo->id, $ben->id, $jane->id]);

        // ---- Home Group Expenses ----

        // Expense 1: Rent, paid by Demo, split between Demo, Ahmed, Yassine
        $rentExpense = Expense::create([
            'category' => 'Rent',
            'description' => 'Pay the house rent before 25 july',
            'amount' => 1800,
            'currency' => 'MAD',
            'payer_id' => $demo->id,
            'group_id' => $homeGroup->id,
        ]);

        $rentShare = 1800 / 3;

        ExpenseSplit::create(['expense_id' => $rentExpense->id, 'user_id' => $demo->id, 'share_amount' => $rentShare, 'is_paid' => true]);
        ExpenseSplit::create(['expense_id' => $rentExpense->id, 'user_id' => $yassine->id, 'share_amount' => $rentShare, 'is_paid' => true]);
        ExpenseSplit::create(['expense_id' => $rentExpense->id, 'user_id' => $ahmed->id, 'share_amount' => $rentShare, 'is_paid' => false]);

        // Expense 2: Repairs, paid by Yassine, split between Ahmed, Yassine, Demo
        $repairsExpense = Expense::create([
            'category' => 'Repairs',
            'description' => 'Fixing refrigerator cooling problems',
            'amount' => 900,
            'currency' => 'MAD',
            'payer_id' => $yassine->id,
            'group_id' => $homeGroup->id,
        ]);

        $repairsShare = 900 / 3;

        ExpenseSplit::create(['expense_id' => $repairsExpense->id, 'user_id' => $yassine->id, 'share_amount' => $repairsShare, 'is_paid' => true]);
        ExpenseSplit::create(['expense_id' => $repairsExpense->id, 'user_id' => $ahmed->id, 'share_amount' => $repairsShare, 'is_paid' => true]);
        ExpenseSplit::create(['expense_id' => $repairsExpense->id, 'user_id' => $demo->id, 'share_amount' => $repairsShare, 'is_paid' => false]);

        // ---- Travel Group Expenses ----

        // Expense 1: Transportation, paid by Demo, split between Demo, Ben, Jane
        $transportExpense = Expense::create([
            'category' => 'Transportation',
            'description' => 'Costs of traveling by bus and train',
            'amount' => 240,
            'currency' => 'USD',
            'payer_id' => $demo->id,
            'group_id' => $travelGroup->id,
        ]);

        $transportShare = 240 / 3;

        ExpenseSplit::create(['expense_id' => $transportExpense->id, 'user_id' => $demo->id, 'share_amount' => $transportShare, 'is_paid' => true]);
        ExpenseSplit::create(['expense_id' => $transportExpense->id, 'user_id' => $ben->id, 'share_amount' => $transportShare, 'is_paid' => true]);
        ExpenseSplit::create(['expense_id' => $transportExpense->id, 'user_id' => $jane->id, 'share_amount' => $transportShare, 'is_paid' => false]);

        // Expense 2: Camping, paid by Jane, split between Ben, Jane, Demo
        $campingExpense = Expense::create([
            'category' => 'Camping',
            'description' => 'Costs of purchasing camping equipment',
            'amount' => 360,
            'currency' => 'USD',
            'payer_id' => $jane->id,
            'group_id' => $travelGroup->id,
        ]);

        $campingShare = 360 / 3;

        ExpenseSplit::create(['expense_id' => $campingExpense->id, 'user_id' => $jane->id, 'share_amount' => $campingShare, 'is_paid' => true]);
        ExpenseSplit::create(['expense_id' => $campingExpense->id, 'user_id' => $ben->id, 'share_amount' => $campingShare, 'is_paid' => true]);
        ExpenseSplit::create(['expense_id' => $campingExpense->id, 'user_id' => $demo->id, 'share_amount' => $campingShare, 'is_paid' => false]);
    }
}