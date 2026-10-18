import Link from "next/link";
import { ContactAvatar } from "@/components/contact-avatar";
import { formatListStamp } from "@/lib/chat-time";

export type ContactRowData = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  stage: { name: string; color: string } | null;
  lastActivity: Date | null;
  policyCount: number;
};

export function ContactRow({ contact, now }: { contact: ContactRowData; now: Date }) {
  const place = [contact.city, contact.state].filter(Boolean).join(", ");
  const details = [contact.phone, place, contact.email].filter(Boolean);

  return (
    <Link
      href={`/contacts/${contact.id}`}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
    >
      <ContactAvatar name={contact.name} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate text-[15px] font-medium text-gray-900">{contact.name}</p>
          {contact.stage && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: contact.stage.color }}
              />
              {contact.stage.name}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-gray-500">
          {details.length > 0 ? details.join(" · ") : "Sin datos de contacto"}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-xs text-gray-400">
          {contact.lastActivity ? formatListStamp(contact.lastActivity, now) : "Sin actividad"}
        </p>
        {contact.policyCount > 0 && (
          <p className="mt-0.5 text-xs text-gray-500">
            {contact.policyCount} {contact.policyCount === 1 ? "póliza" : "pólizas"}
          </p>
        )}
      </div>
    </Link>
  );
}
