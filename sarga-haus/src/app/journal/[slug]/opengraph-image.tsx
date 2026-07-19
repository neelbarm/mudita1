import { ImageResponse } from "next/og";
import { allEssays, getEssay } from "@/lib/essays";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return allEssays().map((e) => ({ slug: e.slug }));
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = getEssay(slug);
  const title = essay?.title ?? "Notes from the studio";
  const minutes = essay?.minutes ?? 3;

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <path d="M8 3.5 H17 Q20.5 3.5 20.5 7 V17 Q20.5 20.5 17 20.5 H10" stroke="#ede9e0" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M3.5 16.5 V7 Q3.5 3.5 7 3.5" stroke="#ede9e0" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
              <path d="M2.5 21.5 L6.5 17.5" stroke="#c4a87a" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div style={{ fontSize: 26 }}>Sarga Haus</div>
          </div>
          <div style={{ fontSize: 19, color: "#857e72", letterSpacing: 3, textTransform: "uppercase" }}>Journal</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <div style={{ fontSize: title.length > 40 ? 56 : 66, lineHeight: 1.1, letterSpacing: -1.5, maxWidth: 1010, display: "flex", flexWrap: "wrap" }}>
            {title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 64, height: 2, background: "#c4a87a" }} />
            <div style={{ fontSize: 22, color: "#b4ada0" }}>{`${minutes} minute read`}</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
