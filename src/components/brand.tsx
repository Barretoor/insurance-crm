import Link from "next/link";

/** Same shield-and-check mark as the app icon (public/icons/icon.svg). */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={`flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      <rect width="512" height="512" rx="108" fill="#2f6fe0" />
      <path
        d="M256 96 L372 134 V262 C372 344 322 400 256 428 C190 400 140 344 140 262 V134 Z"
        fill="#ffffff"
      />
      <path
        d="M196 264 L240 308 L322 202"
        fill="none"
        stroke="#2f6fe0"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandLogo({
  href,
  size = "md",
  centered = false,
}: {
  href?: string;
  size?: "md" | "lg";
  centered?: boolean;
}) {
  const content = (
    <>
      <BrandMark className={size === "lg" ? "h-12 w-12" : "h-8 w-8"} />
      <span className={`flex flex-col leading-tight ${centered ? "items-center" : ""}`}>
        <span
          className={`font-semibold tracking-tight text-gray-900 ${
            size === "lg" ? "text-lg" : "text-[15px]"
          }`}
        >
          Andrea Insurance
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
          Seguros de vida
        </span>
      </span>
    </>
  );

  const classes = `flex items-center gap-2.5 ${
    centered ? "flex-col text-center gap-2" : ""
  }`;

  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
