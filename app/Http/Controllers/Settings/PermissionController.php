<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StorePermissionRequest;
use App\Http\Requests\Settings\UpdatePermissionRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    // Middleware is now handled in routes

    public function index(): Response
    {
        $permissions = Permission::with('roles')->paginate(15);

        return Inertia::render('settings/permissions/index', [
            'permissions' => $permissions,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('settings/permissions/create');
    }

    public function store(StorePermissionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Permission::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        return redirect()->route('permissions.index')
            ->with('success', 'Permission created successfully.');
    }

    public function edit(Permission $permission): Response
    {
        return Inertia::render('settings/permissions/edit', [
            'permission' => $permission->load('roles'),
        ]);
    }

    public function update(UpdatePermissionRequest $request, Permission $permission): RedirectResponse
    {
        $validated = $request->validated();

        $permission->update([
            'name' => $validated['name'],
        ]);

        return redirect()->route('permissions.index')
            ->with('success', 'Permission updated successfully.');
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        // Prevent deletion of core permissions
        $corePermissions = [
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
            'permissions.view',
            'permissions.create',
            'permissions.edit',
            'permissions.delete'
        ];

        if (in_array($permission->name, $corePermissions)) {
            return redirect()->route('permissions.index')
                ->with('error', 'Core permissions cannot be deleted.');
        }

        if ($permission->roles()->count() > 0) {
            return redirect()->route('permissions.index')
                ->with('error', 'Cannot delete permission that is assigned to roles.');
        }

        $permission->delete();

        return redirect()->route('permissions.index')
            ->with('success', 'Permission deleted successfully.');
    }
}
