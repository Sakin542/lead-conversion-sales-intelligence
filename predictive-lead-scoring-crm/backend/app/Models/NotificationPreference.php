<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lead_assignment_enabled',
        'hot_lead_enabled',
        'lead_score_enabled',
        'follow_up_enabled',
    ];

    protected $casts = [
        'lead_assignment_enabled' => 'boolean',
        'hot_lead_enabled' => 'boolean',
        'lead_score_enabled' => 'boolean',
        'follow_up_enabled' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

