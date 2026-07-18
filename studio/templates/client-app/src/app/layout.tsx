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
      </body>
    </html>
  );
}
