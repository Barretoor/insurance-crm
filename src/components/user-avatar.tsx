export function UserAvatar({
  name,
  email,
  avatarUrl,
  className = "h-8 w-8 text-xs",
}: {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      // Data-URI avatar (base64 stored in the DB) - plain <img>, not
      // next/image, which doesn't handle data: URLs.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name ?? email ?? "Avatar"}
        className={`flex-shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-gray-200 font-medium text-gray-700 ${className}`}
    >
      {getInitials(name, email)}
    </span>
  );
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }
  if (email) return email[0]?.toUpperCase() ?? "?";
  return "?";
}
