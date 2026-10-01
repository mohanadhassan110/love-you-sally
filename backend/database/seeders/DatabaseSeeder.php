<?php

namespace Database\Seeders;

use App\Models\Couple;
use App\Models\Memory;
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
                'partner_one' => 'Julian',
                'partner_two' => 'Clara',
                'relationship_start_date' => '2023-04-15 18:30:00',
                'quote' => '“In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.”',
                'quote_author' => 'Maya Angelou',
                'pin' => '1314',
                'custom_audio_url' => null,
            ]
        );

        // 2. Seed Initial Memories
        $memories = [
            [
                'milestone' => '01',
                'title' => 'The Rainy Café in Montmartre',
                'tag' => 'Where It Began',
                'date' => '2023-04-15',
                'location' => 'Paris, France',
                'story' => 'It was pouring rain outside, and we both dashed under the little red awning of Café des Deux Moulins with soaked jackets and cold hands. You ordered hot chocolate with cinnamon, and I spilled half my espresso laughing at your drenched umbrella story. That afternoon, three hours disappeared in what felt like three minutes. I walked you back under the streetlamps, knowing with absolute certainty that my life had just quietly changed forever.',
                'image' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
                'likes' => 24,
                'is_favorite' => true,
            ],
            [
                'milestone' => '02',
                'title' => 'Under the Starlit Ridge',
                'tag' => 'First Roadtrip',
                'date' => '2023-07-22',
                'location' => 'Big Sur, California',
                'story' => 'We packed the car with two sleeping bags, an old acoustic guitar, and zero plans. When the fog finally cleared over the Pacific cliffs at midnight, the entire Milky Way spilled across the sky. We sat on the warm hood of the car wrapped in a vintage wool blanket, listening to the waves crash below and talking about the quietest dreams we had never dared tell anyone else.',
                'image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
                'likes' => 19,
                'is_favorite' => false,
            ],
            [
                'milestone' => '03',
                'title' => 'Making Handmade Pasta at 2 AM',
                'tag' => 'Quiet Tuesdays',
                'date' => '2023-11-04',
                'location' => 'Our First Kitchen',
                'story' => 'We were supposed to just order takeout, but you suddenly insisted that we had to learn how to roll tagliatelle from scratch. The countertop became an avalanche of flour, the kitchen radio was playing old French jazz, and there was flour smudged across your nose. It was messy, completely imperfect, and one of the happiest nights of my entire life.',
                'image' => 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=1200&q=80',
                'likes' => 31,
                'is_favorite' => true,
            ],
            [
                'milestone' => '04',
                'title' => 'Winter Lights & Warm Glühwein',
                'tag' => 'Winter Wonder',
                'date' => '2023-12-24',
                'location' => 'Old Town Square',
                'story' => 'Snow was dusting your eyelashes and the golden fairy lights reflecting in your eyes took my breath away. We shared a steaming mug of spiced mulled wine, sharing one pair of gloves because I forgot mine as usual. When you tucked your cold hands into my coat pocket and smiled, the whole freezing city melted away.',
                'image' => 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
                'likes' => 15,
                'is_favorite' => false,
            ],
            [
                'milestone' => '05',
                'title' => '365 Days of Loving You',
                'tag' => 'First Anniversary',
                'date' => '2024-04-15',
                'location' => 'Cliffside Overlook',
                'story' => 'One full year of your laugh, your morning voice, your spontaneous forehead kisses, and your boundless kindness. I gave you that little wooden box with all thirty train ticket stubs and scribbled notes we collected along the way. Seeing your eyes well up with happy tears made me promise myself to spend every tomorrow making you feel this cherished.',
                'image' => 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
                'likes' => 42,
                'is_favorite' => true,
            ],
            [
                'milestone' => '06',
                'title' => 'The Sunset Sail in Amalfi',
                'tag' => 'Summer Dream',
                'date' => '2024-08-19',
                'location' => 'Positano, Italy',
                'story' => 'The boat engine was cut just as the sky turned shades of peach, lavender, and gold. The breeze carried the scent of salty sea air and lemon groves. You leaned against my shoulder as the pastel houses on the cliffs began lighting up like fireflies. That stillness, holding your hand on the open water, is a memory etched into my soul forever.',
                'image' => 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
                'likes' => 27,
                'is_favorite' => true,
            ],
        ];

        foreach ($memories as $item) {
            Memory::create($item);
        }
    }
}
