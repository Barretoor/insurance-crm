import type { ReactNode } from "react";
import { requireSession } from "@/lib/session";
import { NavBar } from "@/components/nav-bar";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession();

  return (
    <div className="flex flex-1">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
