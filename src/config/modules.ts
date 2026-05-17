import { BarChart3, Boxes, CalendarDays, ClipboardCheck, Factory, ShieldCheck } from "lucide-react";

export const platformModules = [
  {
    id: "leave",
    name: "Leave Management",
    phase: 5,
    icon: CalendarDays,
    permissions: ["employee", "manager", "hr", "admin"]
  },
  {
    id: "inventory",
    name: "Inventory & Assets",
    phase: 3,
    icon: Boxes,
    permissions: ["inventory_officer", "admin"]
  },
  {
    id: "gear-desk",
    name: "Gear Desk",
    phase: 4,
    icon: ClipboardCheck,
    permissions: ["employee", "gear_desk_officer", "admin"]
  },
  {
    id: "productions",
    name: "Productions",
    phase: 6,
    icon: Factory,
    permissions: ["production_coordinator", "manager", "admin"]
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    phase: 8,
    icon: BarChart3,
    permissions: ["manager", "hr", "admin"]
  },
  {
    id: "security",
    name: "Audit & Security",
    phase: 8,
    icon: ShieldCheck,
    permissions: ["admin"]
  }
] as const;
