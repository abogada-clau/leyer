import { ImageResponse } from "next/og";

export const alt =
  "Leyer — Claridad, por diseño. Sistema visual para estudios jurídicos.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#183A30",
          color: "#F7F6F3",
          padding: 65,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 47, letterSpacing: -3 }}>leyer.</span>
          <span style={{ fontSize: 14, letterSpacing: 4, color: "#CAD8CD" }}>
            SISTEMA DE DISEÑO
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ fontSize: 82, letterSpacing: -4 }}>
            Claridad, por diseño.
          </span>
          <span style={{ fontSize: 24, color: "#CAD8CD" }}>
            Un lenguaje común. Infinitas posibilidades.
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 10,
              background: "#A35638",
            }}
          />
          <span style={{ fontSize: 15, color: "#E6DCCB" }}>
            Sitios web / Administración / Contenido editorial
          </span>
        </div>
      </div>
    ),
    size,
  );
}
