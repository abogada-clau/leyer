import { setTimeout } from "node:timers/promises";
async function main() {
  const origin = process.env.APP_URL || "http://localhost:3000";
  if (!process.env.WORKER_SECRET || process.env.WORKER_SECRET.length < 32)
    throw new Error(
      "Configura WORKER_SECRET de al menos 32 caracteres en el servidor y el worker.",
    );
  async function tick() {
    try {
      const res = await fetch(`${origin}/api/workers/publications`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.WORKER_SECRET}` },
        signal: AbortSignal.timeout(55000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (
        data.scheduledProcessed ||
        data.invalidated ||
        process.argv.includes("--once")
      )
        console.log(new Date().toISOString(), data);
      return true;
    } catch (e) {
      console.error(
        new Date().toISOString(),
        e instanceof Error ? e.message : "Error de worker",
      );
      return false;
    }
  }
  if (process.argv.includes("--once")) {
    if (!(await tick())) process.exitCode = 1;
  } else {
    console.log("Worker de publicaciones activo. Intervalo: 30 segundos.");
    while (true) {
      await tick();
      await setTimeout(30000);
    }
  }
}
main().catch((e) => {
  console.error(
    e instanceof Error ? e.message : "No se pudo completar el comando.",
  );
  process.exitCode = 1;
});
