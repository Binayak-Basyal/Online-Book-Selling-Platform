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
    Schema::create('categories', function (Blueprint $table) {
        $table->id();
        $table->string('category_name');
        $table->timestamps();
    });

    Schema::create('subcategories', function (Blueprint $table) {
        $table->id();
        $table->string('subcategory_name'); 
        $table->unsignedBigInteger('category_id');
        $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
        $table->timestamps();
    });

    Schema::create('subsubcategories', function (Blueprint $table) {
        $table->id();
        $table->string('subsubcategory_name');
        $table->unsignedBigInteger('category_id');
        $table->unsignedBigInteger('subcategory_id');
        $table->foreign('subcategory_id')->references('id')->on('subcategories')->onDelete('cascade');
        $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subsubcategories');
        Schema::dropIfExists('subcategories');
        Schema::dropIfExists('categories');
    }
};
