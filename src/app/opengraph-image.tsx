import { ImageResponse } from "next/og";

export const alt = "Jazzmin Sicat-Cabizares — AI Automation Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#090d0f",
          padding: "80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #22d3ee, #6366f1)",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#22d3ee",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "28px",
          }}
        >
          Build with Jazz
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 68,
            fontWeight: 700,
            color: "#f5f7f7",
            lineHeight: 1.15,
          }}
        >
          <span>I build AI systems that turn</span>
          <span>repetitive work into</span>
          <span style={{ color: "#22d3ee" }}>reliable automation.</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#a7b0b5",
            marginTop: "40px",
          }}
        >
          Jazzmin Sicat-Cabizares · AI Automation Engineer
        </div>
      </div>
    ),
    size,
  );
}
