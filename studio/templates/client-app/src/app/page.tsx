/**
 * Sections land here as the Builder implements the approved spec,
 * one section per build run, each behind the review gate.
 */
export default function Home() {
  return (
    <div className="container-page" style={{ paddingBlock: "6rem" }}>
      <p style={{ color: "var(--text-faint)", fontSize: "0.8125rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
        __NAME__
      </p>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem, 6vw, 3.6rem)", lineHeight: 1.05, maxWidth: "22ch" }}>
        Scaffolded and waiting for its first section.
      </h1>
      <p style={{ color: "var(--text-dim)", maxWidth: "48ch", marginTop: "1.5rem" }}>
        The design spec lives in src/design. The Builder implements it
        section by section; each section passes the craft critic and a
        human review before the next begins.
      </p>
    </div>
  );
}
