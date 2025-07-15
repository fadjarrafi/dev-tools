import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Management',
        href: '/settings/roles',
    },
    {
        title: 'Edit Role',
        href: '#',
    },
];

type Permission = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
};

type RoleForm = {
    name: string;
    permissions: string[];
};

interface EditRoleProps {
    role: Role;
    permissions: Permission[];
}

export default function EditRole({ role, permissions }: EditRoleProps) {
    const { data, setData, put, errors, processing } = useForm<RoleForm>({
        name: role.name,
        permissions: role.permissions.map((p) => p.name),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('roles.update', role.id));
    };

    const handlePermissionChange = (permissionName: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permissionName),
            );
        }
    };

    // Group permissions by category
    const groupedPermissions = permissions.reduce(
        (acc, permission) => {
            const [category] = permission.name.split('.');
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(permission);
            return acc;
        },
        {} as Record<string, Permission[]>,
    );

    const isProtectedRole = role.name === 'Admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role: ${role.name}`} />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <HeadingSmall title={`Edit Role: ${role.name}`} description="Modify role permissions and settings" />
                                {isProtectedRole && <Badge variant="destructive">Protected</Badge>}
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={route('roles.index')}>Cancel</Link>
                        </Button>
                    </div>

                    {isProtectedRole && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                <strong>Warning:</strong> This is a protected system role. Changes should be made carefully.
                            </p>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Role Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="e.g., Editor, Manager, Moderator"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-4">
                            <Label>Permissions</Label>
                            <div className="grid gap-4 md:grid-cols-2">
                                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                                    <Card key={category}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium capitalize">{category} Management</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {categoryPermissions.map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`permission-${permission.id}`}
                                                        checked={data.permissions.includes(permission.name)}
                                                        onCheckedChange={(checked) => handlePermissionChange(permission.name, checked as boolean)}
                                                    />
                                                    <Label htmlFor={`permission-${permission.id}`} className="text-sm font-normal">
                                                        <code className="rounded bg-muted px-1 py-0.5 text-xs">{permission.name}</code>
                                                    </Label>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <InputError message={errors.permissions} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Role'}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={route('roles.index')}>Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
