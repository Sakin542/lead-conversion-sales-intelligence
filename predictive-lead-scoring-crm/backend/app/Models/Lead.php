<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'assigned_to',
        'first_name',
        'last_name',
        'email',
        'phone',
        'company',
        'job_title',
        'source',
        'status',
        'industry',
        'company_size',
        'estimated_value',
        'notes',
        'score',
        'last_notified_score',
        'hot_notified',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'estimated_value' => 'decimal:2',
        'score' => 'integer',
        'last_notified_score' => 'integer',
        'hot_notified' => 'boolean',
    ];

    /**
     * Get the user that owns the lead.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the assigned sales rep user.
     */
    public function assignedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Alias for assignedToUser.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the assigned sales rep or fallback to lead owner.
     */
    public function getAssignedSalesRepresentative(): ?User
    {
        return $this->assignedToUser ?? $this->user;
    }

    /**
     * Get the activities for the lead.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class);
    }

    /**
     * Get the deals for the lead.
     */
    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    /**
     * Get the follow ups for the lead.
     */
    public function followUps(): HasMany
    {
        return $this->hasMany(FollowUp::class);
    }
}
