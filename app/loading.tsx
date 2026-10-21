export default function Loading() {
  return (
    <main
      className="mx-auto max-w-6xl animate-pulse px-6 py-24"
      aria-busy="true"
      aria-label="Cargando página"
    >
      <span className="sr-only" role="status">
        Cargando contenido del estudio…
      </span>
      <div className="h-5 w-40 rounded bg-muted" />
      <div className="mt-8 h-16 max-w-2xl rounded bg-muted" />
      <div className="mt-8 h-5 max-w-xl rounded bg-muted" />
      <div className="mt-12 h-64 rounded-xl bg-muted" />
    </main>
  );
}
