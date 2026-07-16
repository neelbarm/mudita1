"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The reading spine: a hairline on the right edge that fills with page
 * progress and names the chapter under the reader. Driven by the same
 * data-bp attributes blueprint mode uses. Desktop only, decorative.
 */
export function Spine() {
  const fillRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState("");

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        if (fillRef.current) fillRef.current.style.height = `${p * 100}%`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = Array.from(document.querySelectorAll("[data-bp]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const raw = e.target.getAttribute("data-bp") || "";
            const name = raw.split("·")[1]?.split("—")[0]?.trim() || raw;
            setChapter(name);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach((s) => io.observe(s));

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex"
    >
      <div className="relative h-36 w-px bg-line">
        <div ref={fillRef} className="absolute left-0 top-0 w-px bg-brass-bright" style={{ height: "0%" }} />
      </div>
      <p
        className="text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-t3"
        style={{ writingMode: "vertical-rl" }}
      >
        {chapter}
      </p>
    </div>
  );
}
