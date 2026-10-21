import { NextResponse } from "next/server";
import type { PublicContext } from "./types";
import { publicHref } from "./paths";
const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
/** Send status and body together: streamed RSC metadata cannot change an already-sent 200. */
export function publicMissing(context?: PublicContext | null) {
  const href = context ? publicHref(context, "/") : "/";
  return new NextResponse(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Página no disponible · Leyer</title><script>try{const theme=localStorage.getItem('theme');if(theme!=='system')document.documentElement.dataset.mode=theme==='dark'?'dark':'light'}catch{}</script><style>
:root{color-scheme:light dark;--background:45 20% 96%;--foreground:156 19% 17%;--muted-foreground:150 6% 42%;--border:45 12% 86%;--ring:163 42% 26%}
@media(prefers-color-scheme:dark){:root:not([data-mode="light"]){--background:160 15% 9%;--foreground:45 20% 92%;--muted-foreground:150 7% 65%;--border:160 9% 23%;--ring:138 27% 70%}}
:root[data-mode="dark"]{color-scheme:dark;--background:160 15% 9%;--foreground:45 20% 92%;--muted-foreground:150 7% 65%;--border:160 9% 23%;--ring:138 27% 70%}:root[data-mode="light"]{color-scheme:light}
*{box-sizing:border-box}body{margin:0;background:hsl(var(--background));color:hsl(var(--foreground));font:16px/1.7 system-ui,sans-serif}main{max-width:38rem;min-height:100vh;margin:auto;padding:64px 24px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}strong{font:italic 40px Georgia,serif;margin-bottom:48px}h1{font:400 clamp(38px,6vw,52px)/1.1 Georgia,serif;margin:12px 0}p{color:hsl(var(--muted-foreground))}a{color:inherit;border:1px solid hsl(var(--border));border-radius:10px;padding:10px 18px;text-decoration:none;margin-top:16px}a:hover{background:hsl(var(--border))}a:focus-visible{outline:2px solid hsl(var(--ring));outline-offset:4px}</style></head><body><main><strong>Leyer.</strong><p>Página no disponible · 404</p><h1>No encontramos esta página.</h1><p>La dirección puede haber cambiado, el contenido pudo retirarse o el sitio aún no está activo.</p><a href="${escape(href)}">Volver al inicio</a></main></body></html>`,
    {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
