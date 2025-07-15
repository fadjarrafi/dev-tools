import PermissionDenied from '@/components/permission-denied';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface CanProps {
    permission?: string;
    role?: string;
    children: ReactNode;
    fallback?: ReactNode;
    renderFallback?: boolean;
}

export default function Can({ permission, role, children, fallback, renderFallback = false }: CanProps) {
    const { auth } = usePage<SharedData>().props;

    const hasPermission = () => {
        if (!auth.user) return false;

        if (permission) {
            return auth.user.permissions?.some((p) => p.name === permission) || false;
        }

        if (role) {
            return auth.user.roles?.some((r) => r.name === role) || false;
        }

        return true;
    };

    if (hasPermission()) {
        return <>{children}</>;
    }

    if (renderFallback && fallback) {
        return <>{fallback}</>;
    }

    if (renderFallback) {
        return (
            <PermissionDenied
                title="Feature Unavailable"
                message="This feature requires additional permissions. Contact your administrator to request access."
                showBackButton={false}
                showHomeButton={false}
            />
        );
    }

    return null;
}

// Utility hooks for permission checking
export function usePermission(permission: string): boolean {
    const { auth } = usePage<SharedData>().props;
    return auth.user?.permissions?.some((p) => p.name === permission) || false;
}

export function useRole(role: string): boolean {
    const { auth } = usePage<SharedData>().props;
    return auth.user?.roles?.some((r) => r.name === role) || false;
}
