import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0c0b",
          padding: "72px",
          color: "#f2ede4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#d4a017",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0a0c0b",
              fontSize: "40px",
              fontWeight: 700,
            }}
          >
            B
          </div>
          <span style={{ fontSize: "34px", fontWeight: 700 }}>
            BroMountain Adventures
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: "74px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            Trekking in Uttarkashi
          </div>
          <div style={{ fontSize: "34px", color: "#d4a017" }}>
            Go where roads don&apos;t.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "26px",
            color: "#9fb3a6",
          }}
        >
          <span>Uttarkashi · Uttarakhand · India</span>
          <span>bromountain.in</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
