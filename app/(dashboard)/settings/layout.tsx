'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Profile", href: "/settings/profile" },
    { name: "Account", href: "/settings/account" },
    { name: "Appearance", href: "/settings/appearance" },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1 font-medium">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tab Navigation Bar - Thay bg-[#16161a] bằng bg-secondary/50 */}
      <div className="flex p-1 bg-secondary/50 rounded-lg border border-border w-fit overflow-x-auto shadow-sm">
        {tabs.map((tab) => {
          // Kiểm tra xem tab nào đang active dựa trên URL
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Nội dung thay đổi theo từng Page con */}
      <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </div>
    </div>
  );
}