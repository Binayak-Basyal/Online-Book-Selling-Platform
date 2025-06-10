<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Message extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;
    
    protected $fillable = [
        'message',
        'seen',
        'sender_id',
        'receiver_id'
    ];
    
    /**
     * Get the sender user.
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
    
    /**
     * Get the receiver user.
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
