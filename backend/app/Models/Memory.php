<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Memory extends Model
{
    use HasFactory;

    protected $fillable = [
        'milestone',
        'title',
        'tag',
        'date',
        'location',
        'story',
        'image',
        'likes',
        'is_favorite',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'likes' => 'integer',
        'is_favorite' => 'boolean',
    ];

    /**
     * Ensure image URLs are fully qualified if stored locally.
     */
    protected function image(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (!$value) return '';
                if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, 'data:')) {
                    return $value;
                }
                $cleanPath = ltrim($value, '/');
                return url($cleanPath);
            }
        );
    }
}
