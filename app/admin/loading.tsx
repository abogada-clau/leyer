export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <p>Cargando tu espacio de trabajo…</p>
      <div className="h-48 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
    </div>
  );
}
