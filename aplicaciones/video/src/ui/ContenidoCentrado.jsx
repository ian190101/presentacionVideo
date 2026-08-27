export function ContenidoCentrado({ children, formato }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: formato === "vertical" ? "110px 76px" : "110px 140px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}
    >
      {children}
    </div>
  );
}
