import { Lock, LogIn } from "lucide-react";
import { useState } from "react";
import { BotonIcono } from "../componentes/BotonIcono.jsx";

export function LoginPanel({ onIngresar }) {
  const [correo, setCorreo] = useState("admin@mrrobot.bo");
  const [contrasena, setContrasena] = useState("demo-seguro");

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
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-md bg-robot-tinta text-lg font-black text-white">
            MR
          </div>
          <h1 className="text-2xl font-black text-slate-950">Panel de presentacion</h1>
          <p className="mt-2 text-sm text-slate-500">
            Ingresa para editar contenido, narracion, assets y video.
          </p>
        </div>
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Correo</span>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm"
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
              className="w-full rounded-md border border-slate-200 px-9 py-2.5 text-sm"
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              type="password"
              required
            />
          </div>
        </label>
        <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-robot-rojo px-4 text-sm font-bold text-white transition hover:bg-robot-rojoOscuro">
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
