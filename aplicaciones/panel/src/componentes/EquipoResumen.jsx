export function EquipoResumen({ integrantes, colorSecundario = "#22c7dd" }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-950">Equipo y stack</h2>
        <p className="mt-1 text-sm text-slate-500">
          Vista rapida de perfiles que alimentaran la seccion animada del video.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {integrantes.map((integrante) => (
          <article key={integrante.id} className="rounded-md border border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-slate-100 text-sm font-bold text-slate-700">
                {integrante.nombre.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">{integrante.nombre}</h3>
                <p className="text-xs text-slate-500">{integrante.cargo}</p>
              </div>
            </div>
            <p className="mb-3 text-sm leading-5 text-slate-600">{integrante.especialidad}</p>
            <div className="space-y-2">
              {integrante.habilidades.map(([nombre, nivel]) => (
                <div key={nombre}>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>{nombre}</span>
                    <span>{nivel}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${nivel}%`, backgroundColor: colorSecundario }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
