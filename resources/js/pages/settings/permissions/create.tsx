import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permission Management',
        href: '/settings/permissions',
    },
    {
        title: 'Create Permission',
        href: '/settings/permissions/create',
    },
];

type PermissionForm = {
    name: string;
    description: string;
};

export default function CreatePermission() {
    const { data, setData, post, errors, processing } = useForm<PermissionForm>({
        name: '',
        description: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('permissions.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Permission" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall title="Create Permission" description="Add a new permission to the system" />
                        <Button variant="outline" asChild>
                            <Link href={route('permissions.index')}>Cancel</Link>
                        </Button>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Permission Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="e.g., posts.create, users.edit"
                                className="font-mono"
                            />
                            <p className="text-sm text-muted-foreground">Use dot notation (e.g., resource.action) for consistency</p>
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Brief description of what this permission allows"
                                rows={3}
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Permission'}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={route('permissions.index')}>Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
