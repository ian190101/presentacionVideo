import React from "react";
import { createRoot } from "react-dom/client";
import { AplicacionPanel } from "./pantallas/AplicacionPanel.jsx";
import "./estilos/global.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AplicacionPanel />
  </React.StrictMode>
);
