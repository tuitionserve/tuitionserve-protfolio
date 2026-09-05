import { ImageResponse } from "next/og";

export const alt = "TuitionServe - We Provide Best, We Serve Best";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A4D8C 0%, #0F4C81 100%)",
          position: "relative",
        }}
      >
        {/* Subtle geometric background decoration */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 300, height: 300, borderRadius: "50%", border: "40px solid rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -100, left: -50, width: 400, height: 400, borderRadius: "50%", border: "60px solid rgba(255,255,255,0.02)" }} />

        {/* Master Logo Lockup for OG */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg width="256" height="256" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#FFFFFF" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 256 420 Q 180 390 90 370 L 90 130 Q 180 150 256 180 Q 332 150 422 130 L 422 370 Q 332 390 256 420 Z" />
              <line x1="256" y1="180" x2="256" y2="420" />
              <path d="M 140 220 Q 190 230 210 240" strokeWidth="24" />
              <path d="M 140 280 Q 190 290 210 300" strokeWidth="24" />
              <path d="M 140 340 Q 190 350 210 360" strokeWidth="24" />
              <path d="M 372 220 Q 322 230 302 240" strokeWidth="24" />
              <path d="M 372 280 Q 322 290 302 300" strokeWidth="24" />
              <path d="M 372 340 Q 322 350 302 360" strokeWidth="24" />
            </g>
          </svg>

          <h1 style={{ fontSize: 110, fontWeight: 800, color: "white", marginTop: 30, marginBottom: 0, letterSpacing: "-0.02em", fontFamily: "sans-serif" }}>
            TuitionServe
          </h1>

          <p style={{ fontSize: 32, fontWeight: 700, color: "rgba(255, 255, 255, 0.8)", letterSpacing: "0.15em", marginTop: 10, fontFamily: "sans-serif" }}>
            WE PROVIDE BEST · WE SERVE BEST
          </p>
        </div>
      </div>
    ),
    { ...size },
  );
}
