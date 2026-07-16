import Link from "next/link";
import { Mark } from "@/components/logo";

export default function NotFound() {
  return (
    <div data-ground="ink" className="flex min-h-svh flex-col items-center justify-center bg-ink px-6 text-center">
      <div className="text-cream-faint">
        <Mark size={44} />
      </div>
      <h1 className="display-l mt-8 text-cream">This page never took form.</h1>
      <p className="mt-5 max-w-md text-[0.9375rem] text-cream-dim">
        The address is wrong or the page has moved. Either way, the way back is simple.
      </p>
      <Link
        href="/"
        className="mt-9 inline-flex min-h-11 items-center rounded-full bg-cream px-6 py-2.5 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-brass-bright"
      >
        Back to the studio
      </Link>
    </div>
  );
}
