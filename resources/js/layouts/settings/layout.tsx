import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: null,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: null,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Users',
        href: '/settings/users',
        icon: null,
        permission: 'users.view',
    },
    {
        title: 'Roles',
        href: '/settings/roles',
        icon: null,
        permission: 'roles.view',
    },
    {
        title: 'Permissions',
        href: '/settings/permissions',
        icon: null,
        permission: 'permissions.view',
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const { auth } = usePage<SharedData>().props;
    const currentPath = window.location.pathname;

    // Filter admin nav items based on permissions (no role checks)
    const visibleAdminNavItems = adminNavItems.filter((item) => {
        if (!item.permission) return true;
        return auth.user?.permissions?.some((p) => p.name === item.permission) || false;
    });

    // Check if user has any admin permissions (to show admin section)
    const hasAnyAdminPermission = auth.user?.permissions?.some((p) => ['users.view', 'roles.view', 'permissions.view'].includes(p.name)) || false;

    return (
        <div className="px-4 py-6">
            <Heading title="Settings" description="Manage your profile and account settings" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {/* Personal Settings */}
                        <div className="mb-2">
                            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Personal</h4>
                            {sidebarNavItems.map((item, index) => (
                                <Button
                                    key={`${item.href}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-muted': currentPath === item.href,
                                    })}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </div>

                        {/* Admin Settings - Show if user has any admin permissions */}
                        {hasAnyAdminPermission && visibleAdminNavItems.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Administration</h4>
                                {visibleAdminNavItems.map((item, index) => (
                                    <Button
                                        key={`${item.href}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn('w-full justify-start', {
                                            'bg-muted': currentPath === item.href,
                                        })}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.title}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1">
                    <section className="space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
