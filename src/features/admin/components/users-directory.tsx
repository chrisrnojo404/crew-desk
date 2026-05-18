"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DirectusRole, DirectoryUser } from "@/features/admin/types";

function displayName(user: DirectoryUser) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
}

export function UsersDirectory({ users, roles }: { users: DirectoryUser[]; roles: DirectusRole[] }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = role === "all" || user.role?.id === role;
      const haystack = [
        displayName(user),
        user.email,
        user.employee_id,
        user.department,
        user.job_title,
        user.status,
        user.role?.name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesRole && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [query, role, users]);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>User Directory</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Manage people, roles, departments, and access posture.</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite user
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users, departments, titles"
              className="pl-9"
            />
          </div>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
            aria-label="Filter by role"
          >
            <option value="all">All roles</option>
            {roles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-md border bg-card">
        <div className="grid min-w-[860px] grid-cols-[1.4fr_1fr_1fr_1fr_120px] border-b px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <div>User</div>
          <div>Role</div>
          <div>Department</div>
          <div>Manager</div>
          <div>Status</div>
        </div>
        {filteredUsers.length ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="grid min-w-[860px] grid-cols-[1.4fr_1fr_1fr_1fr_120px] items-center border-b px-4 py-4 text-sm last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{displayName(user)}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <Badge variant="secondary">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {user.role?.name ?? "Unassigned"}
                </Badge>
              </div>
              <div className="truncate text-muted-foreground">{user.department ?? "No department"}</div>
              <div className="truncate text-muted-foreground">
                {user.manager ? displayName(user.manager as DirectoryUser) : "Not assigned"}
              </div>
              <div>
                <Badge variant={user.status === "active" ? "default" : "outline"}>{user.status ?? "unknown"}</Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-sm text-muted-foreground">No users match the current filters.</div>
        )}
      </div>
    </div>
  );
}
