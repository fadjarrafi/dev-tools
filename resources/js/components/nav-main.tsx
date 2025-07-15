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
import { ChevronRight, Hash } from "lucide-react";

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();
  const { auth } = usePage<SharedData>().props;

  // Check if user has hash permissions
  const hasHashPermission =
    auth.user?.permissions?.some((p) => p.name === "hash.view") || false;

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
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

        {/* Hash Tools Section */}
        {hasHashPermission && (
          <Collapsible asChild defaultOpen={page.url.startsWith("/hash")}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={{ children: "Hash Tools" }}>
                  <Hash />
                  <span>Hash Tools</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={page.url === "/hash/bcrypt"}
                    >
                      <Link href="/hash/bcrypt" prefetch>
                        <span>Bcrypt Generator</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
