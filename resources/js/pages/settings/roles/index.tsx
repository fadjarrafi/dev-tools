import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Shield, Trash2, Users } from 'lucide-react';

import Can from '@/components/can';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Management',
        href: '/settings/roles',
    },
];

type Permission = {
    name: string;
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
    users_count?: number;
    created_at: string;
};

type RolesIndexProps = {
    roles: Role[];
};

export default function RolesIndex({ roles }: RolesIndexProps) {
    const handleDelete = (role: Role) => {
        if (role.name === 'Admin') {
            alert('Admin role cannot be deleted.');
            return;
        }

        if ((role.users_count || 0) > 0) {
            alert('Cannot delete role that has assigned users.');
            return;
        }

        if (confirm('Are you sure you want to delete this role?')) {
            router.delete(route('roles.destroy', role.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Management" />

            <SettingsLayout>
                <Can
                    permission="roles.view"
                    renderFallback={true}
                    fallback={
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">You don't have permission to view roles.</p>
                        </div>
                    }
                >
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <HeadingSmall title="Role Management" description="Manage user roles and their permissions" />
                            <Can permission="roles.create">
                                <Button asChild>
                                    <Link href={route('roles.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Role
                                    </Link>
                                </Button>
                            </Can>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role Name</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                    <span className="font-medium">{role.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">{role.users_count || 0} users</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex max-w-xs flex-wrap gap-1">
                                                    {role.permissions.length > 0 ? (
                                                        <>
                                                            {role.permissions.slice(0, 2).map((permission) => (
                                                                <Badge key={permission.name} variant="secondary" className="text-xs">
                                                                    {permission.name}
                                                                </Badge>
                                                            ))}
                                                            {role.permissions.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{role.permissions.length - 2} more
                                                                </Badge>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No permissions</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {role.name === 'Admin' && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Protected
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Can permission="roles.edit">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route('roles.edit', role.id)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </Can>
                                                    <Can permission="roles.delete">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(role)}
                                                            disabled={role.name === 'Admin'}
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
