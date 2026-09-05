<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'score',
        'conversion_probability',
        'temperature',
        'model_name',
        'scored_at',
    ];

    protected $casts = [
        'score' => 'integer',
        'conversion_probability' => 'float',
        'scored_at' => 'datetime',
    ];

    /**
     * Get the lead that owns the score.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}

