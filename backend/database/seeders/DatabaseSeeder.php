<?php

namespace Database\Seeders;

use App\Models\Couple;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Couple profile
        Couple::firstOrCreate(
            ['id' => 1],
            [
                'partner_one' => 'مهند',
                'partner_two' => 'سالي',
                'relationship_start_date' => '2023-10-01 23:30:00',
                'quote' => 'بحبك وهفضل احبك لحد م اموت',
                'quote_author' => 'حبيبك مهند',
                'pin' => '1104',
                'custom_audio_url' => null,
            ]
        );
    }
}
