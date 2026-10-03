<?php

use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\CoupleController;
use App\Http\Controllers\Api\MemoryController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn() => response()->json([
    'status' => 'ok',
    'server' => 'Laravel 12 API',
    'database' => 'MySQL',
    'timestamp' => now()->toIso8601String(),
]));

// Couple Profile & PIN verification
Route::get('/couple', [CoupleController::class, 'show']);
Route::put('/couple', [CoupleController::class, 'update']);
Route::post('/couple', [CoupleController::class, 'update']); // Alias for form post
Route::post('/verify-pin', [CoupleController::class, 'verifyPin']);

// Memory Timeline CRUD & Interactions
Route::get('/memories', [MemoryController::class, 'index']);
Route::post('/memories', [MemoryController::class, 'store']);
Route::get('/memories/{id}', [MemoryController::class, 'show']);
Route::put('/memories/{id}', [MemoryController::class, 'update']);
Route::post('/memories/{id}', [MemoryController::class, 'update']); // Allows multipart file upload on edit
Route::delete('/memories/{id}', [MemoryController::class, 'destroy']);
Route::post('/memories/{id}/like', [MemoryController::class, 'like']);

// Backup & Factory Reset
Route::get('/backup/export', [BackupController::class, 'export']);
Route::post('/backup/import', [BackupController::class, 'import']);
Route::post('/backup/reset', [BackupController::class, 'reset']);
