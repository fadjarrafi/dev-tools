import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import Can from "@/components/can";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem, type SharedData } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import {
  StickyNote,
  FolderKanban,
  Brush,
  Hash,
  FolderTree,
  Database,
  Settings,
  Users,
  Shield,
  ArrowRight,
  Zap,
  Clock,
  Star,
} from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
];

interface QuickAccessItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  category: "tools" | "productivity" | "admin";
  featured?: boolean;
  badge?: string;
}

const quickAccessItems: QuickAccessItem[] = [
  // Productivity Tools
  {
    title: "Notes",
    description: "Create and organize your notes and documentation",
    href: "/notes",
    icon: StickyNote,
    permission: "notes.view",
    category: "productivity",
    featured: true,
    badge: "Popular",
  },
  {
    title: "Kanban Board",
    description: "Manage projects with visual task boards",
    href: "/kanban",
    icon: FolderKanban,
    permission: "kanban.view",
    category: "productivity",
    featured: true,
    badge: "New",
  },
  {
    title: "Excalidraw",
    description: "Create beautiful diagrams and sketches",
    href: "/excalidraw",
    icon: Brush,
    permission: "excalidraw.view",
    category: "productivity",
  },

  // Developer Tools
  {
    title: "Bcrypt Generator",
    description: "Generate secure bcrypt hashes for passwords",
    href: "/hash/bcrypt",
    icon: Hash,
    permission: "hash.view",
    category: "tools",
  },
  {
    title: "Directory Tree",
    description: "Generate directory structure trees",
    href: "/tree",
    icon: FolderTree,
    permission: "tree.view",
    category: "tools",
  },
  {
    title: "Migration Generator",
    description: "Generate Laravel database migrations",
    href: "/tools/migration-generator",
    icon: Database,
    permission: "migration.view",
    category: "tools",
  },

  // Admin Tools
  {
    title: "User Management",
    description: "Manage users, roles, and permissions",
    href: "/settings/users",
    icon: Users,
    permission: "users.view",
    category: "admin",
  },
  {
    title: "Role Management",
    description: "Configure roles and permissions",
    href: "/settings/roles",
    icon: Shield,
    permission: "roles.view",
    category: "admin",
  },
  {
    title: "Settings",
    description: "Configure your account and preferences",
    href: "/settings/profile",
    icon: Settings,
    permission: undefined, // No permission needed for profile
    category: "admin",
  },
];

const recentActivities = [
  {
    action: "Created new kanban board",
    time: "2 hours ago",
    icon: FolderKanban,
  },
  { action: "Updated user permissions", time: "1 day ago", icon: Shield },
  { action: "Generated bcrypt hash", time: "2 days ago", icon: Hash },
  { action: "Created new note", time: "3 days ago", icon: StickyNote },
];

export default function Dashboard() {
  const { auth } = usePage<SharedData>().props;

  // Helper function to check permissions
  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true;
    return auth.user?.permissions?.some((p) => p.name === permission) || false;
  };

  // Filter items based on permissions
  const visibleItems = quickAccessItems.filter((item) =>
    hasPermission(item.permission)
  );

  // Group items by category
  const featuredItems = visibleItems.filter((item) => item.featured);
  const productivityItems = visibleItems.filter(
    (item) => item.category === "productivity"
  );
  const toolItems = visibleItems.filter((item) => item.category === "tools");
  const adminItems = visibleItems.filter((item) => item.category === "admin");

  const QuickAccessCard = ({ item }: { item: QuickAccessItem }) => (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
            <item.icon className="h-5 w-5" />
          </div>
          {item.badge && (
            <Badge variant="secondary" className="text-xs">
              {item.badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{item.title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {item.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button asChild className="w-full group">
          <Link href={item.href}>
            Open
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex-1 space-y-8 p-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {auth.user.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's what you can do with your workspace today.
          </p>
        </div>

        {/* Featured Items */}
        {featuredItems.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Featured</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item) => (
                <QuickAccessCard key={item.href} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Productivity Tools */}
          {productivityItems.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Productivity</h2>
              </div>
              <div className="space-y-3">
                {productivityItems.map((item) => (
                  <Card
                    key={item.href}
                    className="group hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={item.href}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Developer Tools */}
          {toolItems.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                <h2 className="text-xl font-semibold">Developer Tools</h2>
              </div>
              <div className="space-y-3">
                {toolItems.map((item) => (
                  <Card
                    key={item.href}
                    className="group hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-50 text-green-600">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={item.href}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Admin & Settings */}
          {adminItems.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl font-semibold">Administration</h2>
              </div>
              <div className="space-y-3">
                {adminItems.map((item) => (
                  <Can key={item.href} permission={item.permission}>
                    <Card className="group hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {item.description}
                            </p>
                          </div>
                          <Button asChild size="sm" variant="ghost">
                            <Link href={item.href}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Can>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Recent Activity */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 rounded-full bg-gray-100">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Notes
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 this week</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Projects
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">3 active</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Tools Used
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">this month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Team Size
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">just you</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
