import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type NavItem, type SharedData } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import {
  ChevronRight,
  Hash,
  FolderTree,
  StickyNote,
  FolderKanban,
  Database,
} from "lucide-react";

interface NavSubItem {
  title: string;
  href: string;
  permission?: string;
}

interface NavToolItem {
  title: string;
  icon: React.ComponentType;
  permission?: string;
  href?: string; // For single tools without sub-items
  urlPrefix?: string; // For tool groups with sub-items
  items?: NavSubItem[]; // Sub-items for tool groups
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();
  const { auth } = usePage<SharedData>().props;

  // Helper function to check permissions
  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true;
    return auth.user?.permissions?.some((p) => p.name === permission) || false;
  };

  // Filter main nav items based on permissions
  const visibleMainItems = items.filter((item) =>
    hasPermission(item.permission)
  );

  // Define tools - both single tools and tool groups
  const toolItems: NavToolItem[] = [
    // Single tools (no sub-items)
    // {
    //   title: "Base64 Encoder/Decoder",
    //   icon: FileText,
    //   permission: "base64.view",
    //   href: "/tools/base64",
    // },

    {
      title: "Notes",
      icon: StickyNote,
      permission: "notes.view",
      href: "/notes",
    },
    {
      title: "Kanban Board",
      icon: FolderKanban,
      permission: "kanban.view",
      href: "/kanban",
    },

    // Tool groups (with sub-items)
    {
      title: "Hash Tools",
      icon: Hash,
      permission: "hash.view",
      urlPrefix: "/tools/hash",
      items: [
        {
          title: "Bcrypt Generator",
          href: "/hash/bcrypt",
          permission: "hash.view",
        },
      ],
    },
    {
      title: "Tree Tools",
      icon: FolderTree,
      permission: "tree.view",
      urlPrefix: "/tools/tree",
      items: [
        {
          title: "Directory Tree",
          href: "/tree",
          permission: "tree.view",
        },
      ],
    },
    {
      title: "Migration Generator",
      icon: Database,
      permission: "migration.view",
      href: "/tools/migration-generator",
    },
  ];

  // Filter and process tool items
  const visibleToolItems = toolItems.filter((tool) => {
    // Check if user has the main tool permission
    if (!hasPermission(tool.permission)) return false;

    // For tool groups, check if any sub-items are visible
    if (tool.items) {
      const visibleSubItems = tool.items.filter((item) =>
        hasPermission(item.permission)
      );
      return visibleSubItems.length > 0;
    }

    // For single tools, they're visible if permission check passed
    return true;
  });

  // Helper function to check if a tool item is active
  const isToolItemActive = (tool: NavToolItem): boolean => {
    if (tool.href) {
      // Single tool - exact match or starts with for nested routes
      return page.url === tool.href || page.url.startsWith(tool.href + "/");
    }
    if (tool.urlPrefix) {
      // Tool group - check if current URL starts with the prefix
      return page.url.startsWith(tool.urlPrefix);
    }
    return false;
  };

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {/* Main navigation items */}
        {visibleMainItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={page.url.startsWith(item.href)}
              tooltip={{ children: item.title }}
            >
              <Link href={item.href} prefetch>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        {/* Tool items - both single tools and tool groups */}
        {visibleToolItems.map((tool) => {
          const isActive = isToolItemActive(tool);

          // Single tool without sub-items
          if (tool.href && !tool.items) {
            return (
              <SidebarMenuItem key={tool.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={{ children: tool.title }}
                >
                  <Link href={tool.href} prefetch>
                    <tool.icon />
                    <span>{tool.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // Tool group with sub-items
          if (tool.items) {
            const visibleSubItems = tool.items.filter((item) =>
              hasPermission(item.permission)
            );

            // If only one sub-item is visible, render it as a single tool
            if (visibleSubItems.length === 1) {
              const singleItem = visibleSubItems[0];
              return (
                <SidebarMenuItem key={tool.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      page.url === singleItem.href ||
                      page.url.startsWith(singleItem.href + "/")
                    }
                    tooltip={{ children: singleItem.title }}
                  >
                    <Link href={singleItem.href} prefetch>
                      <tool.icon />
                      <span>{singleItem.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            // Multiple sub-items - render as collapsible group
            return (
              <Collapsible asChild defaultOpen={isActive} key={tool.title}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={{ children: tool.title }}>
                      <tool.icon />
                      <span>{tool.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {visibleSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={
                              page.url === subItem.href ||
                              page.url.startsWith(subItem.href + "/")
                            }
                          >
                            <Link href={subItem.href} prefetch>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return null;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
