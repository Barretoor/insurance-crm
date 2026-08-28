"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Calendar,
  Kanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Phone,
  PhoneMissed,
  User,
  Users,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contactos", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/tareas", label: "Tareas", icon: ListChecks },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/calls/unmatched", label: "Sin asociar", icon: PhoneMissed },
  { href: "/numbers", label: "Números", icon: Phone, adminOnly: true },
  { href: "/profile", label: "Mi perfil", icon: User },
];

export function NavBar({ avatarUrl }: { avatarUrl: string | null }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-surface">
      <div className="px-5 py-5">
        <span className="text-sm font-medium text-gray-900">
          CRM Seguros de Vida
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {links
          .filter((link) => !link.adminOnly || isAdmin)
          .map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent-50 font-medium text-accent-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {link.label}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        {session?.user && (
          <div className="flex items-center gap-2 px-2.5 py-1">
            <UserAvatar
              name={session.user.name}
              email={session.user.email}
              avatarUrl={avatarUrl}
              className="h-7 w-7 text-[11px]"
            />
            <p className="truncate text-xs text-gray-500">
              {session.user.name ?? session.user.email}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
