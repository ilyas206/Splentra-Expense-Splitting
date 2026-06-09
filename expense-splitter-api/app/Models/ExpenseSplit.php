<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseSplit extends Model
{
    protected $fillable = [
        'share_amount',
        'is_paid',
        'expense_id',
        'user_id',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function expense() {
        return $this->belongsTo(Expense::class);
    }
}
