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
        Schema::create('couples', function (Blueprint $table) {
            $table->id();
            $table->string('partner_one')->default('Julian');
            $table->string('partner_two')->default('Clara');
            $table->dateTime('relationship_start_date');
            $table->text('quote');
            $table->string('quote_author')->nullable();
            $table->string('pin')->default('1314');
            $table->text('custom_audio_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('couples');
    }
};
