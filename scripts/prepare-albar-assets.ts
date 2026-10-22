import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { downloadImage } from "../lib/media/download-image";
import { optimizeImage } from "../lib/media/process-image";

// Public originals from the client's current site, not the conceptual mockup portrait.
const sources = [
  { key: "claudia-perfil", url: "https://albar-abogados.b-cdn.net/2026/08/c3099ff0-d7a7-46bb-8188-93a254cfa427.jpg", alt: "Claudia Albiña Aros, abogada y fundadora de ALBAR Abogados." },
  { key: "claudia-hero", url: "https://albar-abogados.b-cdn.net/2026/08/8e10d3b4-53ab-465b-a968-cbfdf9cbd1c3.png", alt: "Claudia Albiña Aros en la imagen de presentación de ALBAR Abogados." },
  { key: "logo", url: "https://albar-abogados.b-cdn.net/2026/08/Logo%20web.png", alt: "ALBAR Abogados." },
];
async function main() {
  const folder = "supabase/seeds/albar/assets";
  await mkdir(folder, { recursive: true });
  const manifest = [];
  for (const source of sources) {
    const input = await downloadImage(source.url);
    const image = await optimizeImage(input.data, `${source.key}.webp`);
    await writeFile(`${folder}/${image.filename}`, image.data);
    manifest.push({ ...source, filename: image.filename, width: image.width, height: image.height, byte_size: image.byteSize, original_byte_size: image.originalByteSize, checksum_sha256: createHash("sha256").update(image.data).digest("hex"), optimization: "webp-lossless-v1" });
    console.log(`${source.key}: ${image.width} × ${image.height}, ${image.byteSize} bytes`);
  }
  await writeFile(`${folder}/manifest.json`, JSON.stringify(manifest, null, 2) + "\n");
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
