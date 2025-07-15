import PermissionDenied from '@/components/permission-denied';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Access Denied',
        href: '#',
    },
];

interface PermissionDeniedPageProps {
    title?: string;
    message?: string;
}

export default function PermissionDeniedPage({ title, message }: PermissionDeniedPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Access Denied" />

            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
                <PermissionDenied title={title} message={message} />
            </div>
        </AppLayout>
    );
}
