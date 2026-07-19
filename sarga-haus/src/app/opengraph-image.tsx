import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d0c0a",
          color: "#ede9e0",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M8 3.5 H17 Q20.5 3.5 20.5 7 V17 Q20.5 20.5 17 20.5 H10" stroke="#ede9e0" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3.5 16.5 V7 Q3.5 3.5 7 3.5" stroke="#ede9e0" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
            <path d="M2.5 21.5 L6.5 17.5" stroke="#c4a87a" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div style={{ fontSize: 30, letterSpacing: -0.5 }}>Sarga Haus</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 64, lineHeight: 1.12, letterSpacing: -1.5, maxWidth: 950, display: "flex", flexWrap: "wrap" }}>
            Build the product. Automate the workflow. Fill the pipeline.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 64, height: 2, background: "#c4a87a" }} />
            <div style={{ fontSize: 24, color: "#b4ada0" }}>A founder-led product studio</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
