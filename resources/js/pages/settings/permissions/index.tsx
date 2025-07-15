import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';

import Can from '@/components/can';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permission Management',
        href: '/settings/permissions',
    },
];

type Permission = {
    id: number;
    name: string;
    roles: Array<{ name: string; id: number }>;
    created_at: string;
};

type PermissionsIndexProps = {
    permissions: {
        data: Permission[];
        links: unknown[];
        meta: unknown;
    };
};

export default function PermissionsIndex({ permissions }: PermissionsIndexProps) {
    const corePermissions = [
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
        'permissions.delete',
    ];

    const handleDelete = (permission: Permission) => {
        if (corePermissions.includes(permission.name)) {
            alert('Core permissions cannot be deleted.');
            return;
        }

        if (permission.roles.length > 0) {
            alert('Cannot delete permission that is assigned to roles.');
            return;
        }

        if (confirm('Are you sure you want to delete this permission?')) {
            router.delete(route('permissions.destroy', permission.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permission Management" />

            <SettingsLayout>
                <Can
                    permission="permissions.view"
                    renderFallback={true}
                    fallback={
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">You don't have permission to view permissions.</p>
                        </div>
                    }
                >
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <HeadingSmall title="Permission Management" description="Manage system permissions and their assignments" />
                            <Can permission="permissions.create">
                                <Button asChild>
                                    <Link href={route('permissions.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Permission
                                    </Link>
                                </Button>
                            </Can>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Permission Name</TableHead>
                                        <TableHead>Assigned Roles</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissions.data.map((permission) => (
                                        <TableRow key={permission.id}>
                                            <TableCell className="font-medium">
                                                <code className="rounded bg-muted px-2 py-1 text-sm">{permission.name}</code>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {permission.roles.map((role) => (
                                                        <Badge key={role.id} variant="secondary">
                                                            {role.name}
                                                        </Badge>
                                                    ))}
                                                    {permission.roles.length === 0 && (
                                                        <span className="text-sm text-muted-foreground">No roles assigned</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {corePermissions.includes(permission.name) && <Badge variant="outline">Core</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Can permission="permissions.edit">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route('permissions.edit', permission.id)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </Can>
                                                    <Can permission="permissions.delete">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(permission)}
                                                            disabled={corePermissions.includes(permission.name)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </Can>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </Can>
            </SettingsLayout>
        </AppLayout>
    );
}
