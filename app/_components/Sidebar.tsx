"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES_CONFIG, UserRole } from "@/app/constants/sidebar-routes";

interface SidebarProps {
  role: UserRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const routes = ROUTES_CONFIG[role] || [];

  const isActive = (href: string) => {
    if (href === `/${role.toLowerCase()}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-background border-r border-border flex flex-col">

      {/* SEARCH */}
      <div className="p-4">
        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-md border border-border focus-within:border-primary transition-all">
          <Search size={16} />
          <input
            placeholder="Search"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

        {routes.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}

      </nav>

    </aside>
  );
}
