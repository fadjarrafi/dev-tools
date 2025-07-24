<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User Management
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Role Management
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',

            // Permission Management
            'permissions.view',
            'permissions.create',
            'permissions.edit',
            'permissions.delete',

            // Hash Tools
            'hash.view',

            // Tree Tools
            'tree.view',

            // Note Tools
            'notes.view',
            'notes.create',
            'notes.edit',
            'notes.delete',

            // Kanban Board
            'kanban.view',
            'kanban.create',
            'kanban.edit',
            'kanban.delete',

            'roles.edit.core',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::create(['name' => 'Admin']);
        $userRole = Role::create(['name' => 'User']);

        // Assign all permissions to Admin
        $adminRole->givePermissionTo(Permission::all());

        // User role gets no permissions by default (can be customized later)
    }
}
