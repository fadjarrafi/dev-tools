<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreRoleRequest;
use App\Http\Requests\Settings\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('roles.view');

        $roles = Role::with(['permissions', 'users'])->get();

        return Inertia::render('settings/roles/index', [
            'roles' => $roles,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('roles.create');

        return Inertia::render('settings/roles/create', [
            'permissions' => Permission::all(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        Gate::authorize('roles.create');

        $validated = $request->validated();

        $role = Role::create(['name' => $validated['name']]);

        if (isset($validated['permissions'])) {
            $role->givePermissionTo($validated['permissions']);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    public function edit(Role $role): Response
    {
        Gate::authorize('roles.edit');

        return Inertia::render('settings/roles/edit', [
            'role' => $role->load('permissions'),
            'permissions' => Permission::all(),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        Gate::authorize('roles.edit');

        // Prevent editing core roles
        if ($role->name === 'Admin' && !auth()->user()->can('roles.edit.core')) {
            return redirect()->route('roles.index')
                ->with('error', 'Core roles require special permissions to edit.');
        }

        $validated = $request->validated();

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        Gate::authorize('roles.delete');

        // Prevent deletion of Admin role
        if ($role->name === 'Admin') {
            return redirect()->route('roles.index')
                ->with('error', 'Admin role cannot be deleted.');
        }

        if ($role->users()->count() > 0) {
            return redirect()->route('roles.index')
                ->with('error', 'Cannot delete role that has assigned users.');
        }

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
