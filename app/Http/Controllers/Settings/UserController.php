<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreUserRequest;
use App\Http\Requests\Settings\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(): Response
    {
        // Additional permission check in controller
        Gate::authorize('users.view');

        $users = User::with('roles')->paginate(10);

        return Inertia::render('settings/users/index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('users.create');

        return Inertia::render('settings/users/create', [
            'roles' => Role::all(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        // Form Request already handles authorization, but we can add extra checks
        Gate::authorize('users.create');

        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        Gate::authorize('users.edit');

        return Inertia::render('settings/users/edit', [
            'user' => $user->load('roles'),
            'roles' => Role::all(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('users.edit');

        // Additional business logic: prevent editing protected users by non-super-admins
        if ($user->isProtected() && !$request->user()->can('users.edit.protected')) {
            return redirect()->route('users.index')
                ->with('error', 'You cannot edit this protected user.');
        }

        $validated = $request->validated();

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        // Only update password if provided
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);
        $user->syncRoles([$validated['role']]);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        Gate::authorize('users.delete');

        // Business logic checks
        if ($user->isProtected()) {
            return redirect()->route('users.index')
                ->with('error', 'This user cannot be deleted.');
        }

        // Prevent users from deleting themselves
        if (auth()->id() === $user->id) {
            return redirect()->route('users.index')
                ->with('error', 'You cannot delete your own account from here.');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }
}
