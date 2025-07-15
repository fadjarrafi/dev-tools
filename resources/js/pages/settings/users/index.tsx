import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/settings/users',
    },
];

type User = {
    id: number;
    name: string;
    email: string;
    is_protected: boolean;
    roles: Array<{ name: string }>;
    created_at: string;
};

type UsersIndexProps = {
    users: {
        data: User[];
        links: unknown[];
        meta: unknown;
    };
};

export default function UsersIndex({ users }: UsersIndexProps) {
    const handleDelete = (user: User) => {
        if (user.is_protected) {
            alert('This user cannot be deleted.');
            return;
        }

        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('users.destroy', user.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall title="User Management" description="Manage system users and their roles" />
                        <Button asChild>
                            <Link href={route('users.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.roles.map((role) => (
                                                <Badge key={role.name} variant="secondary">
                                                    {role.name}
                                                </Badge>
                                            ))}
                                        </TableCell>
                                        <TableCell>{user.is_protected && <Badge variant="outline">Protected</Badge>}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('users.edit', user.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(user)} disabled={user.is_protected}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
