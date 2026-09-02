<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManagerGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'target_value',
        'timeframe',
        'start_date',
        'end_date',
        'created_by',
    ];

    protected $casts = [
        'target_value' => 'float',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

