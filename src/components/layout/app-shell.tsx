"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Boxes, CalendarDays, ClipboardCheck, LayoutDashboard, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SessionUser } from "@/features/auth/types";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leave", href: "/dashboard", icon: CalendarDays },
  { label: "Inventory", href: "/dashboard", icon: Boxes },
  { label: "Approvals", href: "/dashboard", icon: ClipboardCheck },
  { label: "Reports", href: "/dashboard", icon: BarChart3 }
] as const;

export function AppShell({ children, user }: { children: React.ReactNode; user: SessionUser }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card lg:block">
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            CD
          </div>
          <div>
            <p className="font-semibold">Crew Desk</p>
            <p className="text-xs text-muted-foreground">Operations Platform</p>
          </div>
        </div>
        <Separator />
        <nav className="grid gap-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.first_name || user.email}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
