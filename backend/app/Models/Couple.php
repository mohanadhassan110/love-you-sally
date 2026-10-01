<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Couple extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_one',
        'partner_two',
        'relationship_start_date',
        'quote',
        'quote_author',
        'pin',
        'custom_audio_url',
    ];

    protected $casts = [
        'relationship_start_date' => 'datetime',
    ];
}
