<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'category',
        'description',
        'amount',
        'payer_id',
        'group_id',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'payer_id');
    }

    public function group() {
        return $this->belongsTo(Group::class);
    }

    public function expenseSplits() {
        return $this->hasMany(ExpenseSplit::class);
    }
}
