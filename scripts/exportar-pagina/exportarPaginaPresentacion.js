import { mkdirSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export function exportarPaginaPresentacion({ datos, carpetaSalida = "dist/pagina", subdominio = "" }) {
  const destino = resolve(carpetaSalida);
  mkdirSync(destino, { recursive: true });

  writeFileSync(resolve(destino, "index.html"), crearHtml(datos), "utf8");
  writeFileSync(resolve(destino, "_headers"), crearHeaders(), "utf8");
  writeFileSync(resolve(destino, "_redirects"), "/* /index.html 200\n", "utf8");

  if (subdominio) {
    writeFileSync(resolve(destino, "CNAME"), subdominio.replace(/^https?:\/\//, "").trim(), "utf8");
  }

  console.log(`Pagina publica exportada en ${destino}`);
}

function crearHtml(datos) {
  const tema = crearTema(datos);
  const equipo = datos.equipo || [];
  const secciones = datos.secciones || [];
  const clientes = datos.clientes || [];
  const proyectos = datos.proyectos || [];

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MR Robot Bolivia | ${escapar(datos.empresaObjetivo || "Presentacion")}</title>
  <meta name="description" content="${escapar(datos.subtitulo || datos.eslogan || "Presentacion comercial MR Robot Bolivia")}" />
  <style>
    :root {
      --primario: ${tema.primario};
      --secundario: ${tema.secundario};
      --fondo-a: ${tema.fondoA};
      --fondo-b: ${tema.fondoB};
      --texto: #f8fafc;
      --texto-suave: #dbeafe;
      --borde: rgba(255, 255, 255, 0.18);
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      color: var(--texto);
      background:
        radial-gradient(circle at 20% 8%, color-mix(in srgb, var(--primario) 58%, transparent), transparent 28rem),
        linear-gradient(135deg, var(--fondo-a), var(--fondo-b));
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    a { color: inherit; }
    .contenedor { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
    .nav { position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--borde); background: color-mix(in srgb, var(--fondo-a) 84%, transparent); backdrop-filter: blur(16px); }
    .nav__inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 0; }
    .marca { font-weight: 900; letter-spacing: 0.08em; }
    .marca-logo { width: 34px; height: 34px; object-fit: contain; border-radius: ${Number(datos.configuracionLogo?.radioBorde) || 0}%; }
    .marca-wrap { display: flex; align-items: center; gap: 10px; }
    .menu { display: flex; flex-wrap: wrap; gap: 12px; font-size: 14px; color: var(--texto-suave); }
    .menu a { text-decoration: none; }
    .hero { min-height: 84vh; display: grid; align-items: center; padding: 64px 0 48px; }
    .hero h1 { max-width: 980px; margin: 0; font-size: clamp(42px, 8vw, 96px); line-height: 0.98; letter-spacing: 0; }
    .hero p { max-width: 780px; margin: 26px 0 0; color: var(--texto-suave); font-size: clamp(18px, 2.4vw, 28px); line-height: 1.42; }
    .acciones { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 34px; }
    .boton { border: 1px solid var(--borde); border-radius: 8px; padding: 13px 18px; text-decoration: none; font-weight: 800; background: var(--primario); }
    .boton--secundario { background: color-mix(in srgb, var(--secundario) 60%, transparent); }
    section { padding: 78px 0; border-top: 1px solid var(--borde); }
    .encabezado { display: grid; gap: 12px; margin-bottom: 28px; }
    .eyebrow { color: var(--secundario); font-weight: 900; text-transform: uppercase; letter-spacing: 0.14em; font-size: 13px; }
    h2 { margin: 0; font-size: clamp(30px, 4vw, 54px); line-height: 1.05; }
    .grid { display: grid; gap: 18px; }
    .grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .card { min-width: 0; border: 1px solid var(--borde); border-radius: 8px; padding: 22px; background: rgba(255, 255, 255, 0.08); }
    .card h3 { margin: 0 0 10px; font-size: 22px; }
    .card p, .lista { margin: 0; color: var(--texto-suave); line-height: 1.55; }
    .lista { padding-left: 18px; }
    .perfil { display: grid; gap: 14px; }
    .perfil__titulo { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--borde); padding-bottom: 14px; }
    .perfil__titulo strong { font-size: 24px; }
    .bloque-cv { display: grid; gap: 8px; }
    .bloque-cv span { color: var(--secundario); font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
    .barra { height: 10px; overflow: hidden; border-radius: 999px; background: rgba(255, 255, 255, 0.16); }
    .barra > i { display: block; height: 100%; border-radius: inherit; background: var(--secundario); }
    .cierre { text-align: center; }
    .cierre p { max-width: 760px; margin: 20px auto 0; color: var(--texto-suave); font-size: 22px; line-height: 1.45; }
    @media (max-width: 820px) {
      .nav__inner { align-items: flex-start; flex-direction: column; }
      .menu { gap: 10px; }
      .grid--3, .grid--2 { grid-template-columns: 1fr; }
      section { padding: 56px 0; }
    }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="contenedor nav__inner">
      <div class="marca marca-wrap">${crearLogoHtml(datos)}<span>MR ROBOT BOLIVIA</span></div>
      <div class="menu">
        ${secciones.map((seccion) => `<a href="#${escaparAtributo(seccion.tipo)}">${escapar(etiquetarSeccion(seccion.tipo))}</a>`).join("")}
      </div>
    </div>
  </nav>

  <main>
    <header class="hero contenedor" id="intro">
      <div>
        <div class="eyebrow">${escapar(datos.empresaObjetivo || "Presentacion comercial")}</div>
        <h1>${escapar(datos.eslogan || "Soluciones informaticas a medida")}</h1>
        <p>${escapar(datos.subtitulo || "")}</p>
        <div class="acciones">
          <a class="boton" href="#cierre">Ver propuesta</a>
          <a class="boton boton--secundario" href="#equipo">Conocer equipo</a>
        </div>
      </div>
    </header>

    <section id="clientes">
      <div class="contenedor">
        <div class="encabezado"><span class="eyebrow">Clientes</span><h2>Experiencia internacional y nacional</h2></div>
        <div class="grid grid--3">${clientes.map((cliente) => crearCardTexto(cliente)).join("")}</div>
      </div>
    </section>

    <section id="proyectos">
      <div class="contenedor">
        <div class="encabezado"><span class="eyebrow">Proyectos</span><h2>Soluciones recientes listas para mostrar</h2></div>
        <div class="grid grid--3">${proyectos.map(crearCardProyecto).join("")}</div>
      </div>
    </section>

    <section id="quienes_somos">
      <div class="contenedor">
        <div class="encabezado"><span class="eyebrow">Quienes somos</span><h2>Un equipo tecnico y operativo completo</h2></div>
        <div class="card"><p>${escapar(datos.quienesSomos || "")}</p></div>
      </div>
    </section>

    <section id="equipo">
      <div class="contenedor">
        <div class="encabezado"><span class="eyebrow">Equipo</span><h2>CV completo y especialidades</h2></div>
        <div class="grid grid--2">${equipo.map(crearCardPerfil).join("")}</div>
      </div>
    </section>

    <section id="habilidades">
      <div class="contenedor">
        <div class="encabezado"><span class="eyebrow">Stack</span><h2>Habilidades animadas y medibles</h2></div>
        <div class="grid grid--2">${equipo.map(crearCardHabilidades).join("")}</div>
      </div>
    </section>

    <section id="cierre" class="cierre">
      <div class="contenedor">
        <span class="eyebrow">Cierre comercial</span>
        <h2>${escapar(datos.empresaObjetivo || "Tu empresa")} puede operar con sistemas preparados para crecer</h2>
        <p>${escapar(datos.cierre || "")}</p>
      </div>
    </section>
  </main>
</body>
</html>`;
}

function crearCardPerfil(persona) {
  const cv = persona.cv || {};

  return `<article class="card perfil">
    <div class="perfil__titulo">
      <div><strong>${escapar(persona.nombre)}</strong><p>${escapar(persona.cargo || "")}</p></div>
      <span class="eyebrow">${escapar(persona.especialidad || "Perfil")}</span>
    </div>
    ${crearBloqueCv("Resumen", persona.resumenProfesional || cv.resumen)}
    ${crearBloqueCv("Experiencia", cv.experiencia || persona.experiencia)}
    ${crearBloqueLista("Estudios", cv.estudios)}
    ${crearBloqueLista("Certificaciones", cv.certificaciones)}
    ${crearBloqueLista("Logros", cv.logros)}
    ${crearBloqueCv("Stack principal", cv.stackPrincipal)}
  </article>`;
}

function crearCardHabilidades(persona) {
  const habilidades = persona.habilidades || [];

  return `<article class="card">
    <h3>${escapar(persona.nombre)}</h3>
    <div class="grid">
      ${habilidades.map(([nombre, nivel]) => `<div>
        <p>${escapar(nombre)} <strong>${Number(nivel) || 0}%</strong></p>
        <div class="barra"><i style="width:${Math.max(0, Math.min(100, Number(nivel) || 0))}%"></i></div>
      </div>`).join("")}
    </div>
  </article>`;
}

function crearCardTexto(texto) {
  if (typeof texto === "object" && texto !== null) {
    return `<article class="card"><h3>${escapar(texto.nombre || "")}</h3><p>${escapar(texto.descripcion || texto.resultado || "")}</p></article>`;
  }

  return `<article class="card"><h3>${escapar(String(texto).split(" - ")[0])}</h3><p>${escapar(String(texto))}</p></article>`;
}

function crearCardProyecto(proyecto) {
  if (typeof proyecto !== "object" || proyecto === null) {
    return crearCardTexto(proyecto);
  }

  return `<article class="card">
    ${proyecto.capturaUrl ? `<img src="${escaparAtributoUrl(proyecto.capturaUrl)}" alt="${escaparAtributoUrl(proyecto.nombre)}" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;margin-bottom:16px" />` : ""}
    <h3>${escapar(proyecto.nombre || "")}</h3>
    <p>${escapar(proyecto.descripcion || "")}</p>
    ${proyecto.mostrarDescripcionCaptura ? `<p style="margin-top:10px">${escapar(proyecto.descripcionCaptura || "")}</p>` : ""}
  </article>`;
}

function crearLogoHtml(datos) {
  if (datos.configuracionLogo?.mostrar === false || !datos.assets?.logo) {
    return "";
  }

  return `<img class="marca-logo" src="${escaparAtributoUrl(datos.assets.logo)}" alt="Logo MR Robot Bolivia" />`;
}

function crearBloqueCv(titulo, contenido) {
  if (!contenido) {
    return "";
  }

  return `<div class="bloque-cv"><span>${escapar(titulo)}</span><p>${escapar(contenido)}</p></div>`;
}

function crearBloqueLista(titulo, items) {
  const lista = Array.isArray(items) ? items.filter(Boolean) : [];

  if (lista.length === 0) {
    return "";
  }

  return `<div class="bloque-cv"><span>${escapar(titulo)}</span><ul class="lista">${lista.map((item) => `<li>${escapar(item)}</li>`).join("")}</ul></div>`;
}

function crearTema(datos) {
  const primario = validarHex(datos.colorPrimario, "#d40511");
  const secundario = validarHex(datos.colorSecundario, "#22c7dd");

  return {
    primario,
    secundario,
    fondoA: oscurecer(primario, 0.28),
    fondoB: oscurecer(secundario, 0.22)
  };
}

function crearHeaders() {
  return `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; img-src 'self' https: data:; media-src 'self' https:; style-src 'unsafe-inline'; script-src 'none'; base-uri 'self'; frame-ancestors 'none'
`;
}

function etiquetarSeccion(tipo) {
  const etiquetas = {
    intro: "Inicio",
    clientes: "Clientes",
    proyectos: "Proyectos",
    quienes_somos: "Quienes somos",
    equipo: "Equipo",
    habilidades: "Stack",
    cierre: "Cierre"
  };

  return etiquetas[tipo] || "Seccion";
}

function validarHex(valor, respaldo) {
  return /^#[0-9a-f]{6}$/i.test(valor || "") ? valor : respaldo;
}

function oscurecer(hex, factor) {
  const rojo = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
  const verde = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
  const azul = Math.round(parseInt(hex.slice(5, 7), 16) * factor);
  return `rgb(${rojo}, ${verde}, ${azul})`;
}

function escapar(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escaparAtributo(valor) {
  return escapar(String(valor || "").replace(/[^a-z0-9_-]/gi, ""));
}

function escaparAtributoUrl(valor) {
  return escapar(String(valor || ""));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const argumentos = leerArgumentos(process.argv.slice(2));
  const rutaDatos = resolve(argumentos.datos || "scripts/renderizar-video/datos-presentacion-ejemplo.json");
  const datos = JSON.parse(readFileSync(rutaDatos, "utf8"));

  exportarPaginaPresentacion({
    datos,
    carpetaSalida: argumentos.salida || "dist/pagina",
    subdominio: argumentos.subdominio || process.env.SUBDOMINIO_PAGINA || ""
  });
}

function leerArgumentos(argumentosCrudos) {
  const argumentos = {};

  for (let indice = 0; indice < argumentosCrudos.length; indice += 1) {
    const actual = argumentosCrudos[indice];

    if (!actual.startsWith("--")) {
      continue;
    }

    const clave = actual.slice(2);
    const siguiente = argumentosCrudos[indice + 1];

    if (!siguiente || siguiente.startsWith("--")) {
      argumentos[clave] = true;
      continue;
    }

    argumentos[clave] = siguiente;
    indice += 1;
  }

  return argumentos;
}
