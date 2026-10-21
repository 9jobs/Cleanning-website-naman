import { ImageResponse } from "next/og";
export const alt =
  "Thrive4 Cleaning — House, Property, Garden & Construction Cleaning";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    <div
      style={{
        background: "#EDF8F1",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "90px",
        justifyContent: "center",
        color: "#2D3339",
      }}
    >
      <div
        style={{
          fontSize: 32,
          letterSpacing: 5,
          display: "flex",
          color: "#1A9257",
        }}
      >
        THRIVE4 CLEANING
      </div>
      <div
        style={{
          fontSize: 82,
          fontWeight: 700,
          lineHeight: 1.1,
          marginTop: 40,
          display: "flex",
        }}
      >
        Clean Spaces.
      </div>
      <div
        style={{
          fontSize: 82,
          fontWeight: 700,
          lineHeight: 1.1,
          display: "flex",
          color: "#1A9257",
        }}
      >
        Better Living.
      </div>
      <div style={{ fontSize: 25, marginTop: 40, display: "flex" }}>
        Homes. Properties. Gardens. Construction sites.
      </div>
    </div>,
    size,
  );
}
