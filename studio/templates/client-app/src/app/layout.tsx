import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "__NAME__",
  description: "__NAME__: built by Sarga Haus.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main id="main">{children}</main>
        {/* The studio credit. You own this site outright: delete this
            footer if you prefer, no hard feelings. It helps the studio
            the way a good building's cornerstone helps its architect. */}
        <footer
          style={{
            padding: "2rem clamp(1.25rem, 5vw, 3.5rem)",
            borderTop: "1px solid var(--line)",
            fontSize: "0.75rem",
            color: "var(--text-faint)",
          }}
        >
          Built by{" "}
          <a
            href="https://sargahaus.com?ref=__SLUG__"
            style={{ color: "var(--text-dim)", textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            Sarga Haus
          </a>
        </footer>
      </body>
    </html>
  );
}
