<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subsubcategory extends Model
{
    protected $fillable = [
        'subsubcategory_name',
        'category_id',
        'subcategory_id',
    ];
    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }
}
