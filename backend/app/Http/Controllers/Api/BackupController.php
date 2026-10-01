<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Couple;
use App\Models\Memory;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class BackupController extends Controller
{
    /**
     * Export all data as a backup JSON payload.
     */
    public function export()
    {
        $couple = Couple::first();
        $memories = Memory::orderBy('date', 'asc')->get();

        return response()->json([
            'version' => '1.0',
            'exportedAt' => now()->toIso8601String(),
            'couple' => [
                'partnerOne' => $couple ? $couple->partner_one : 'Julian',
                'partnerTwo' => $couple ? $couple->partner_two : 'Clara',
                'relationshipStartDate' => $couple && $couple->relationship_start_date ? $couple->relationship_start_date->toIso8601String() : '2023-04-15T18:30:00',
                'quote' => $couple ? $couple->quote : '',
                'quoteAuthor' => $couple ? $couple->quote_author : '',
                'pin' => $couple ? $couple->pin : '1314',
                'customAudioUrl' => $couple ? $couple->custom_audio_url : null,
            ],
            'memories' => $memories,
        ]);
    }

    /**
     * Restore from a backup JSON payload.
     */
    public function import(Request $request)
    {
        $data = $request->json()->all();

        if (empty($data)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid or empty backup data.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            if (isset($data['couple'])) {
                $c = $data['couple'];
                Couple::updateOrCreate(
                    ['id' => 1],
                    [
                        'partner_one' => $c['partnerOne'] ?? 'Julian',
                        'partner_two' => $c['partnerTwo'] ?? 'Clara',
                        'relationship_start_date' => $c['relationshipStartDate'] ?? '2023-04-15 18:30:00',
                        'quote' => $c['quote'] ?? '',
                        'quote_author' => $c['quoteAuthor'] ?? '',
                        'pin' => $c['pin'] ?? '1314',
                        'custom_audio_url' => $c['customAudioUrl'] ?? null,
                    ]
                );
            }

            if (isset($data['memories']) && is_array($data['memories'])) {
                Memory::truncate();
                foreach ($data['memories'] as $m) {
                    Memory::create([
                        'milestone' => $m['milestone'] ?? null,
                        'title' => $m['title'] ?? 'Moment',
                        'tag' => $m['tag'] ?? null,
                        'date' => $m['date'] ?? now()->toDateString(),
                        'location' => $m['location'] ?? null,
                        'story' => $m['story'] ?? null,
                        'image' => $m['image'] ?? '',
                        'likes' => $m['likes'] ?? 0,
                        'is_favorite' => !empty($m['is_favorite']) || !empty($m['isFavorite']),
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Backup restored successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to restore: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset to default romantic sample data.
     */
    public function reset()
    {
        DB::beginTransaction();
        try {
            Memory::truncate();
            Couple::truncate();

            $seeder = new DatabaseSeeder();
            $seeder->run();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Reset to default romantic starter memories.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to reset: ' . $e->getMessage(),
            ], 500);
        }
    }
}
