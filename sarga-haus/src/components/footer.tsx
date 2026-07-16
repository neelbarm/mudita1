import Link from "next/link";
import { Mark } from "./logo";

const COLUMNS = [
  {
    title: "Studio",
    links: [
      { href: "/services", label: "Services" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/builds", label: "Selected builds" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/journal", label: "Journal" },
      { href: "/start", label: "Start a project" },
    ],
  },
];

export function Footer() {
  return (
    <footer data-ground="ink" data-bp="S13 · Footer" className="border-t border-line bg-ink text-t2">
      <div className="container-page pb-10 pt-16 md:pt-20">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 text-cream">
              <Mark size={26} />
              <span className="font-display text-2xl" style={{ fontWeight: 460 }}>
                Sarga Haus
              </span>
            </div>
            <p className="mt-5 text-[0.9375rem] leading-relaxed">
              A founder-led product studio. Ideas and broken operations go in.
              Working systems come out.
            </p>
            <p className="mt-4 text-[0.8125rem] text-t3">
              Sarga: the act of bringing something into form. Said sar-gah house.
            </p>
          </div>
          <div className="flex gap-16 md:gap-24">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="label text-t3">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-[0.9375rem] transition-colors duration-300 hover:text-t1"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 text-[0.8125rem] text-t3 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Sarga Haus. All rights reserved.</p>
          <p>Designed and built in-house. This site is the first system we shipped.</p>
        </div>
      </div>
    </footer>
  );
}
