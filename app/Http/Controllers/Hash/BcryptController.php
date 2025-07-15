<?php

namespace App\Http\Controllers\Hash;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BcryptController extends Controller
{
    public function index()
    {
        return Inertia::render('hash/bcrypt/index');
    }
}
