"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion";
import { Reveal } from "./ui";
import {
  AutomationRunsMock,
  CrmMock,
  DashboardMock,
  MvpMock,
  OutboundMock,
  PortalMock,
} from "./mock-uis";

const ITEMS = [
  { title: "Founder MVP", note: "A product idea shipped as a working app: booking, clients, payments-ready.", Mock: MvpMock },
  { title: "Client portal", note: "Clients see progress, approve work, and pay without a single status email.", Mock: PortalMock },
  { title: "Operator dashboard", note: "The whole operation on one screen, pulled from the tools you already use.", Mock: DashboardMock },
  { title: "CRM pipeline", note: "Every conversation staged, next step assigned, nothing living in memory.", Mock: CrmMock },
  { title: "Outbound console", note: "Personalized outreach drafted by the system, approved by a human, tracked end to end.", Mock: OutboundMock },
  { title: "Automation runs", note: "The repetitive work executing on its own, with judgment kept in the loop.", Mock: AutomationRunsMock },
];

function Card({ item }: { item: (typeof ITEMS)[number] }) {
  return (
    <figure className="w-[82vw] max-w-105 shrink-0 snap-center md:w-105">
      <div className="h-72 overflow-hidden rounded-2xl border border-line bg-raised transition-colors duration-300 hover:border-line-strong">
        <item.Mock />
      </div>
      <figcaption className="mt-4 flex items-start justify-between gap-4 px-1">
        <div>
          <p className="text-[0.9375rem] font-medium text-t1">{item.title}</p>
          <p className="mt-1 max-w-xs text-[0.8125rem] leading-relaxed text-t2">{item.note}</p>
        </div>
        <span className="label mt-1 shrink-0 text-t3">Illustrative system</span>
      </figcaption>
    </figure>
  );
}

export function Gallery() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current || !viewportRef.current) return;
      setDistance(
        Math.max(0, trackRef.current.scrollWidth - viewportRef.current.clientWidth)
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  const header = (
    <div className="container-page">
      <Reveal>
        <p className="label text-accent">What we build</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display-m mt-5 max-w-2xl text-t1">
          The systems behind a running business.
        </h2>
      </Reveal>
      <Reveal delay={0.16}>
        <p className="standfirst mt-5 max-w-2xl text-t2">
          Products, portals, dashboards, CRMs, lead engines, automations. Every
          interface below is labeled for what it is: illustrative, until real
          client work replaces it.
        </p>
      </Reveal>
    </div>
  );

  // Mobile and reduced motion: native snap scroll, no linkage.
  const nativeTrack = (
    <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(1.25rem,5vw)] pb-4">
      {ITEMS.map((item) => (
        <Card key={item.title} item={item} />
      ))}
    </div>
  );

  return (
    <section data-ground="ink" className="bg-ink py-24 md:py-0" id="gallery">
      {reduced ? (
        <div className="md:section-pad">
          {header}
          {nativeTrack}
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div ref={sectionRef} className="relative h-[280vh]">
              <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden" ref={viewportRef}>
                {header}
                <motion.div
                  ref={trackRef}
                  style={{ x }}
                  className="mt-14 flex w-max gap-8 pl-[max(1.25rem,5vw)]"
                >
                  {ITEMS.map((item) => (
                    <Card key={item.title} item={item} />
                  ))}
                  <div className="w-[30vw] shrink-0" aria-hidden="true" />
                </motion.div>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            {header}
            {nativeTrack}
          </div>
        </>
      )}
    </section>
  );
}
