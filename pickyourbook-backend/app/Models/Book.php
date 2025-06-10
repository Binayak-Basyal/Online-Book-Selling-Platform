<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'book_name',
        'book_author',
        'book_publication',
        'book_isbn',
        'book_condition',
        'book_price',
        'book_image',
        'category_id',
        'subcategory_id',
        'subsubcategory_id',
        'owner_email',
        'owner_id'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id','id');
    }

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function subsubcategory()
    {
        return $this->belongsTo(Subsubcategory::class);
    }
}
