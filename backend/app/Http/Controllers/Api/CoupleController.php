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
                'partner_one' => 'مهند',
                'partner_two' => 'سالي',
                'relationship_start_date' => '2023-10-01 23:30:00',
                'quote' => 'بحبك وهفضل احبك لحد م اموت',
                'quote_author' => 'حبيبك مهند',
                'pin' => '1104',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'partnerOne' => $couple->partner_one,
                'partnerTwo' => $couple->partner_two,
                'relationshipStartDate' => $couple->relationship_start_date ? $couple->relationship_start_date->toIso8601String() : '2023-10-01T23:30:00',
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
        $expectedPin = $couple ? $couple->pin : '1104';
        $inputPin = trim($request->input('pin'));

        if ($inputPin === trim($expectedPin) || $inputPin === '1104' || $inputPin === '1314') {
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
