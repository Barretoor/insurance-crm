"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Calendar,
  Kanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Phone,
  PhoneMissed,
  User,
  Users,
  X,
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
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes (e.g. after tapping a
  // link) - adjusted during render rather than in an effect, per React's
  // guidance for resetting state in response to a prop/derived-value change.
  const [drawerPathname, setDrawerPathname] = useState(pathname);
  if (pathname !== drawerPathname) {
    setDrawerPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 bg-surface px-4 py-3 md:hidden">
        <span className="text-sm font-medium text-gray-900">
          CRM Seguros de Vida
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-surface transition-transform duration-200 md:static md:z-auto md:w-60 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <span className="text-sm font-medium text-gray-900">
            CRM Seguros de Vida
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 md:hidden"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
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
    </>
  );
}
