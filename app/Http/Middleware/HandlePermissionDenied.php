<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Exceptions\UnauthorizedException;

class HandlePermissionDenied
{
    public function handle(Request $request, Closure $next)
    {
        try {
            return $next($request);
        } catch (UnauthorizedException $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'You do not have permission to access this resource.',
                ], 403);
            }

            return Inertia::render('errors/permission-denied', [
                'title' => 'Permission Required',
                'message' => 'Sorry, you don\'t have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.',
            ])->toResponse($request)->setStatusCode(403);
        }
    }
}
