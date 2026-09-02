<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MlModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'version',
        'accuracy',
        'precision',
        'recall',
        'f1_score',
        'roc_auc',
        'is_active',
        'feature_importance',
        'last_trained_at',
    ];

    protected $casts = [
        'accuracy' => 'float',
        'precision' => 'float',
        'recall' => 'float',
        'f1_score' => 'float',
        'roc_auc' => 'float',
        'is_active' => 'boolean',
        'feature_importance' => 'array',
        'last_trained_at' => 'datetime',
    ];
}

