<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Memory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MemoryController extends Controller
{
    /**
     * Display a listing of the memories.
     */
    public function index(Request $request)
    {
        $query = Memory::query();

        // Filter by favorites
        if ($request->boolean('favorite')) {
            $query->where('is_favorite', true);
        }

        // Search query
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('story', 'like', "%{$search}%")
                  ->orWhere('tag', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Order
        $order = $request->input('order', 'asc');
        $query->orderBy('date', $order === 'desc' ? 'desc' : 'asc');

        $memories = $query->get();

        return response()->json([
            'status' => 'success',
            'count' => $memories->count(),
            'data' => $memories,
        ]);
    }

    /**
     * Store a newly created memory.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'date' => 'required|date',
            'tag' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:200',
            'milestone' => 'nullable|string|max:20',
            'story' => 'nullable|string',
            'image' => 'nullable',
            'image_file' => 'nullable|image|max:12288',
            'media' => 'nullable',
            'is_favorite' => 'nullable|boolean',
            'isFavorite' => 'nullable|boolean',
        ]);

        $imagePath = '';

        // 1. Check if a binary file was uploaded
        if ($request->hasFile('image_file')) {
            $file = $request->file('image_file');
            $filename = 'memory_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('memories', $filename, 'public');
            $imagePath = '/storage/' . $path;
        } elseif ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = 'memory_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('memories', $filename, 'public');
            $imagePath = '/storage/' . $path;
        } elseif ($request->filled('image')) {
            $imageInput = $request->input('image');

            if (str_starts_with($imageInput, 'data:image')) {
                $imagePath = $this->saveBase64Image($imageInput);
            } else {
                $imagePath = $imageInput;
            }
        } elseif ($request->filled('media')) {
            $mediaInput = $request->input('media');
            if (is_array($mediaInput) && !empty($mediaInput[0]['url'])) {
                $imagePath = $mediaInput[0]['url'];
            }
        }

        if (empty($imagePath)) {
            $imagePath = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80';
        }

        $title = !empty($validated['title']) ? $validated['title'] : (!empty($validated['story']) ? Str::limit($validated['story'], 30) : 'ذكرى جميلة');

        $memory = Memory::create([
            'milestone' => $validated['milestone'] ?? null,
            'title' => $title,
            'tag' => $validated['tag'] ?? null,
            'date' => $validated['date'],
            'location' => $validated['location'] ?? null,
            'story' => $validated['story'] ?? null,
            'image' => $imagePath,
            'likes' => 0,
            'is_favorite' => $request->boolean('is_favorite') || $request->boolean('isFavorite'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Memory created successfully.',
            'data' => $memory,
        ], 201);
    }

    /**
     * Display the specified memory.
     */
    public function show($id)
    {
        $memory = Memory::findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $memory,
        ]);
    }

    /**
     * Update the specified memory.
     */
    public function update(Request $request, $id)
    {
        $memory = Memory::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'tag' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:200',
            'milestone' => 'nullable|string|max:20',
            'story' => 'nullable|string',
            'image' => 'nullable',
            'image_file' => 'nullable|image|max:12288',
            'is_favorite' => 'nullable|boolean',
        ]);

        // Check for new image file
        if ($request->hasFile('image_file') || $request->hasFile('image')) {
            $file = $request->file('image_file') ?? $request->file('image');
            $filename = 'memory_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('memories', $filename, 'public');
            $memory->image = '/storage/' . $path;
        } elseif ($request->filled('image')) {
            $imageInput = $request->input('image');
            if (str_starts_with($imageInput, 'data:image')) {
                $memory->image = $this->saveBase64Image($imageInput);
            } else {
                $memory->image = $imageInput;
            }
        }

        if (isset($validated['title'])) $memory->title = $validated['title'];
        if (isset($validated['date'])) $memory->date = $validated['date'];
        if (array_key_exists('tag', $validated)) $memory->tag = $validated['tag'];
        if (array_key_exists('location', $validated)) $memory->location = $validated['location'];
        if (array_key_exists('milestone', $validated)) $memory->milestone = $validated['milestone'];
        if (array_key_exists('story', $validated)) $memory->story = $validated['story'];
        if ($request->has('is_favorite')) $memory->is_favorite = $request->boolean('is_favorite');

        $memory->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Memory updated successfully.',
            'data' => $memory,
        ]);
    }

    /**
     * Remove the specified memory.
     */
    public function destroy($id)
    {
        $memory = Memory::findOrFail($id);

        // Delete file from local storage if applicable
        $rawImage = $memory->getRawOriginal('image');
        if ($rawImage && str_starts_with($rawImage, '/storage/memories/')) {
            $storagePath = str_replace('/storage/', '', $rawImage);
            Storage::disk('public')->delete($storagePath);
        }

        $memory->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Memory deleted successfully.',
        ]);
    }

    /**
     * Increment like counter.
     */
    public function like($id)
    {
        $memory = Memory::findOrFail($id);
        $memory->increment('likes');

        return response()->json([
            'status' => 'success',
            'likes' => $memory->likes,
        ]);
    }

    /**
     * Helper to decode and persist base64 data URLs to local storage.
     */
    private function saveBase64Image(string $base64): string
    {
        @list($type, $data) = explode(';', $base64);
        @list(, $data)      = explode(',', $data);
        $data = base64_decode($data);

        $extension = 'jpg';
        if (str_contains($type, 'png')) $extension = 'png';
        if (str_contains($type, 'webp')) $extension = 'webp';

        $filename = 'memory_' . time() . '_' . Str::random(8) . '.' . $extension;
        Storage::disk('public')->put('memories/' . $filename, $data);

        return '/storage/memories/' . $filename;
    }
}
