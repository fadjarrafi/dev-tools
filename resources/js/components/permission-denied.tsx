import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Home, ShieldX } from 'lucide-react';

interface PermissionDeniedProps {
    title?: string;
    message?: string;
    action?: string;
    showBackButton?: boolean;
    showHomeButton?: boolean;
}

export default function PermissionDenied({
    title = 'Access Restricted',
    message = "Oops! You don't have permission to access this area. If you believe this is an error, please contact your administrator.",
    action = 'Contact Administrator',
    showBackButton = true,
    showHomeButton = true,
}: PermissionDeniedProps) {
    return (
        <div className="flex min-h-[400px] items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                        <ShieldX className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{message}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                        {showBackButton && (
                            <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Go Back
                            </Button>
                        )}
                        {showHomeButton && (
                            <Button asChild>
                                <Link href={route('dashboard')} className="flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    Go to Dashboard
                                </Link>
                            </Button>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Need access? <button className="text-primary hover:underline">{action}</button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
