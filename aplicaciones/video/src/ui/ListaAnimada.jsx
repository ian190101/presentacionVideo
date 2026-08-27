import { interpolate } from "remotion";

export function ListaAnimada({ items, progreso, color, formato }) {
  return (
    <div style={{ display: "grid", gap: 22, width: "100%", maxWidth: formato === "vertical" ? 760 : 980, marginTop: 54 }}>
      {items.map((item, indice) => {
        const avance = interpolate(progreso, [0.18 + indice * 0.08, 0.42 + indice * 0.08], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp"
        });

        return (
          <div
            key={item}
            style={{
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.07)",
              padding: formato === "vertical" ? "28px 30px" : "26px 34px",
              borderRadius: 8,
              fontSize: formato === "vertical" ? 30 : 34,
              fontWeight: 800,
              textAlign: "left",
              transform: `translateX(${(1 - avance) * 90}px)`,
              opacity: avance
            }}
          >
            <span style={{ color, marginRight: 18 }}>0{indice + 1}</span>
            {item}
          </div>
        );
      })}
    </div>
  );
}
