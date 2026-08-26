import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-6 py-14 text-center">
      <Icon className="mb-1 h-7 w-7 text-gray-300" strokeWidth={1.5} />
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-3 rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
