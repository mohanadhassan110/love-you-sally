<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Couple;
use Illuminate\Http\Request;

class CoupleController extends Controller
{
    /**
     * Get the couple profile details.
     */
    public function show()
    {
        $couple = Couple::first();
        if (!$couple) {
            $couple = Couple::create([
                'partner_one' => 'Julian',
                'partner_two' => 'Clara',
                'relationship_start_date' => '2023-04-15 18:30:00',
                'quote' => '“In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.”',
                'quote_author' => 'Maya Angelou',
                'pin' => '1314',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'partnerOne' => $couple->partner_one,
                'partnerTwo' => $couple->partner_two,
                'relationshipStartDate' => $couple->relationship_start_date ? $couple->relationship_start_date->toIso8601String() : '2023-04-15T18:30:00',
                'quote' => $couple->quote,
                'quoteAuthor' => $couple->quote_author,
                'pin' => $couple->pin,
                'customAudioUrl' => $couple->custom_audio_url,
            ],
        ]);
    }

    /**
     * Verify curator PIN.
     */
    public function verifyPin(Request $request)
    {
        $request->validate([
            'pin' => 'required|string',
        ]);

        $couple = Couple::first();
        $expectedPin = $couple ? $couple->pin : '1314';

        if (trim($request->input('pin')) === trim($expectedPin)) {
            return response()->json([
                'status' => 'success',
                'message' => 'PIN verified successfully.',
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Invalid PIN. Access denied.',
        ], 403);
    }

    /**
     * Update couple profile.
     */
    public function update(Request $request)
    {
        $couple = Couple::first();
        if (!$couple) {
            $couple = new Couple();
        }

        $validated = $request->validate([
            'partnerOne' => 'sometimes|string|max:100',
            'partnerTwo' => 'sometimes|string|max:100',
            'relationshipStartDate' => 'sometimes|string',
            'quote' => 'sometimes|string',
            'quoteAuthor' => 'nullable|string|max:150',
            'pin' => 'sometimes|string|max:30',
            'customAudioUrl' => 'nullable|string',
        ]);

        if (isset($validated['partnerOne'])) $couple->partner_one = $validated['partnerOne'];
        if (isset($validated['partnerTwo'])) $couple->partner_two = $validated['partnerTwo'];
        if (isset($validated['relationshipStartDate'])) $couple->relationship_start_date = $validated['relationshipStartDate'];
        if (isset($validated['quote'])) $couple->quote = $validated['quote'];
        if (array_key_exists('quoteAuthor', $validated)) $couple->quote_author = $validated['quoteAuthor'];
        if (isset($validated['pin'])) $couple->pin = $validated['pin'];
        if (array_key_exists('customAudioUrl', $validated)) $couple->custom_audio_url = $validated['customAudioUrl'];

        $couple->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Couple settings updated successfully.',
            'data' => [
                'partnerOne' => $couple->partner_one,
                'partnerTwo' => $couple->partner_two,
                'relationshipStartDate' => $couple->relationship_start_date ? $couple->relationship_start_date->toIso8601String() : '',
                'quote' => $couple->quote,
                'quoteAuthor' => $couple->quote_author,
                'pin' => $couple->pin,
                'customAudioUrl' => $couple->custom_audio_url,
            ],
        ]);
    }
}
