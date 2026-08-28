import { Lock, LogIn } from "lucide-react";
import { useState } from "react";
import { BotonIcono } from "../componentes/BotonIcono.jsx";

export function LoginPanel({ onIngresar, logoUrl, colores = {} }) {
  const [correo, setCorreo] = useState("admin@mrrobot.bo");
  const [contrasena, setContrasena] = useState("demo-seguro");
  const colorPrimario = colores.colorPrimario || "#d40511";
  const colorSecundario = colores.colorSecundario || "#22c7dd";
  const colorTextoPrimario = obtenerColorTextoActivo(colorPrimario, colorSecundario);

  function enviarFormulario(evento) {
    evento.preventDefault();
    onIngresar({ correo, contrasena });
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form
        onSubmit={enviarFormulario}
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-panel"
      >
        <div className="mb-6 text-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo de Mr Robot Bolivia"
              className="mx-auto mb-4 h-20 w-20 object-contain"
            />
          ) : (
            <div
              className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-md text-lg font-black"
              style={{ backgroundColor: colorPrimario, color: colorTextoPrimario }}
            >
              MR
            </div>
          )}
          <h1 className="text-2xl font-black text-slate-950">Panel de presentacion</h1>
          <p className="mt-2 text-sm text-slate-500">
            Ingresa para editar contenido, narracion, assets y video.
          </p>
        </div>
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Correo</span>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none transition"
            style={{ "--tw-ring-color": colorSecundario }}
            value={correo}
            onChange={(evento) => setCorreo(evento.target.value)}
            type="email"
            required
          />
        </label>
        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Contrasena</span>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              className="w-full rounded-md border border-slate-200 px-9 py-2.5 text-sm outline-none transition"
              style={{ "--tw-ring-color": colorSecundario }}
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              type="password"
              required
            />
          </div>
        </label>
        <button
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition"
          style={{ backgroundColor: colorPrimario, color: colorTextoPrimario }}
        >
          <LogIn size={18} aria-hidden="true" />
          Ingresar
        </button>
        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          Si no hay variables de Supabase configuradas, el panel entra en modo demo local.
        </p>
      </form>
    </main>
  );
}

function obtenerColorTextoActivo(colorPrimario, colorSecundario) {
  if (!esHexValido(colorSecundario) || !esHexValido(colorPrimario)) {
    return "#ffffff";
  }

  const contrasteSecundario = calcularContraste(colorPrimario, colorSecundario);

  if (contrasteSecundario >= 4.5) {
    return colorSecundario;
  }

  return calcularContraste(colorPrimario, "#ffffff") >= calcularContraste(colorPrimario, "#0f172a")
    ? "#ffffff"
    : "#0f172a";
}

function calcularContraste(colorA, colorB) {
  const luminanciaA = calcularLuminancia(colorA);
  const luminanciaB = calcularLuminancia(colorB);
  const claro = Math.max(luminanciaA, luminanciaB);
  const oscuro = Math.min(luminanciaA, luminanciaB);

  return (claro + 0.05) / (oscuro + 0.05);
}

function calcularLuminancia(hex) {
  const valores = [1, 3, 5].map((inicio) => {
    const canal = parseInt(hex.slice(inicio, inicio + 2), 16) / 255;
    return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * valores[0] + 0.7152 * valores[1] + 0.0722 * valores[2];
}

function esHexValido(valor) {
  return /^#[0-9a-f]{6}$/i.test(valor || "");
}
