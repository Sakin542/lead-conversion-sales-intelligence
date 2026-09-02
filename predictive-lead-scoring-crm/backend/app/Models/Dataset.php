<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dataset extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'file_path',
        'row_count',
        'column_count',
        'missing_values_count',
        'duplicate_count',
        'status',
        'uploaded_by',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}

