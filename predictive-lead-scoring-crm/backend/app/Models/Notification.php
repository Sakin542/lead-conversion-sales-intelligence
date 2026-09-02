<?php

namespace App\Models;

use Illuminate\Notifications\DatabaseNotification as BaseDatabaseNotification;

class Notification extends BaseDatabaseNotification
{
    protected $table = 'notifications';

    protected $fillable = [
        'id',
        'type',
        'notifiable_type',
        'notifiable_id',
        'user_id',
        'title',
        'message',
        'entity_type',
        'entity_id',
        'metadata',
        'priority',
        'event_key',
        'data',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

