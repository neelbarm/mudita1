import Link from "next/link";

/**
 * The Sarga mark: a square being formed. Two strokes close the form;
 * one brass fragment is still arriving. Fragments becoming structure.
 */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 3.5 H17 Q20.5 3.5 20.5 7 V17 Q20.5 20.5 17 20.5 H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.5 16.5 V7 Q3.5 3.5 7 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M2.5 21.5 L6.5 17.5"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 text-t1 ${className}`}
      aria-label="Sarga Haus, home"
    >
      <Mark />
      <span
        className="font-display text-[1.05rem] tracking-[-0.01em]"
        style={{ fontWeight: 480 }}
      >
        Sarga Haus
      </span>
    </Link>
  );
}
