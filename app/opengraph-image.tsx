import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Uchechukwu Onuoma: healthcare, data and Customer Success";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card, rendered to a static PNG at build time. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f5f0eb",
          color: "#2b1a20",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", right: -120, top: -80, width: 520, height: 520, borderRadius: 260, background: "#fbe1ea", display: "flex" }} />
        <div style={{ position: "absolute", right: 140, bottom: 60, width: 120, height: 120, borderRadius: 60, background: "#f7a93b", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              background: "#641f36",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            UO
          </div>
          <div style={{ fontSize: 30, color: "#b0285a", fontWeight: 700, letterSpacing: 4 }}>PORTFOLIO</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 800, color: "#641f36", lineHeight: 1.02 }}>Uchechukwu Onuoma</div>
          <div style={{ fontSize: 36, marginTop: 20, color: "#5c4a50", maxWidth: 880 }}>
            Healthcare × Customer Success × Data Science, on the way to health data research.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
