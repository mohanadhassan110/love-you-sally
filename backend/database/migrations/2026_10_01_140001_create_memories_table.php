<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('memories', function (Blueprint $table) {
            $table->id();
            $table->string('milestone')->nullable();
            $table->string('title');
            $table->string('tag')->nullable();
            $table->date('date');
            $table->string('location')->nullable();
            $table->text('story')->nullable();
            $table->longText('image'); // Can be an external URL, base64 data URL, or storage URL
            $table->unsignedInteger('likes')->default(0);
            $table->boolean('is_favorite')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('memories');
    }
};
