import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { optimizeImage, webpFilename } from "../lib/media/process-image";
import {
  isPublicAddress,
  parseImageUrl,
  downloadImage,
} from "../lib/media/download-image";
import { assertSameOrigin, readMediaForm } from "../lib/media/request";
import { readImageSource } from "../lib/media/source";
import { MAX_MEDIA_BYTES } from "../lib/media/shared";

test("lossless WebP preserves every decoded RGBA pixel, including transparent RGB", async () => {
  const pixels = Buffer.from(
    Array.from({ length: 16 * 16 * 4 }, (_, i) => (i * 37 + 13) % 256),
  );
  const png = await sharp(pixels, {
    raw: { width: 16, height: 16, channels: 4 },
  })
    .png()
    .toBuffer();
  const image = await optimizeImage(png, "Árbol de prueba.PNG");
  assert.equal(image.filename, "Arbol-de-prueba.webp");
  assert.equal(image.width, 16);
  assert.equal(image.height, 16);
  assert.equal((await sharp(image.data).metadata()).format, "webp");
  assert.deepEqual(await sharp(image.data).raw().toBuffer(), pixels);
});

test("JPEG pixels are preserved without a second lossy encoding", async () => {
  const jpeg = await sharp({
    create: { width: 64, height: 32, channels: 3, background: "#183A30" },
  })
    .jpeg()
    .toBuffer();
  const webp = await optimizeImage(jpeg, "foto.jpg");
  assert.deepEqual(
    await sharp(webp.data).raw().toBuffer(),
    await sharp(jpeg).raw().toBuffer(),
  );
});

test("EXIF orientation is applied and EXIF/GPS metadata is removed", async () => {
  const jpeg = await sharp({
    create: { width: 40, height: 20, channels: 3, background: "white" },
  })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();
  const webp = await optimizeImage(jpeg, "portrait.jpg");
  assert.equal(webp.width, 20);
  assert.equal(webp.height, 40);
  const metadata = await sharp(webp.data).metadata();
  assert.equal(metadata.orientation, undefined);
  assert.equal(metadata.exif, undefined);
});

test("invalid files and SVG are rejected based on bytes, regardless of filename", async () => {
  await assert.rejects(optimizeImage(Buffer.from("%PDF-1.7 fake"), "foto.jpg"));
  await assert.rejects(
    optimizeImage(
      Buffer.from('<svg width="20" height="20"></svg>'),
      "fake.png",
    ),
    /Elige una imagen/,
  );
  await assert.rejects(optimizeImage(Buffer.alloc(0), "empty.png"), /25 MB/);
  await assert.rejects(
    optimizeImage(Buffer.alloc(MAX_MEDIA_BYTES + 1), "large.png"),
    /25 MB/,
  );
});

test("oversized pixel dimensions are rejected before decoding", async () => {
  const big = await sharp({
    create: { width: 6000, height: 5000, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  await assert.rejects(optimizeImage(big, "large.png"), /24 megapíxeles/);
});

test("animation is rejected instead of silently discarding frames", async () => {
  const frames = Buffer.concat([
    Buffer.alloc(2 * 2 * 4, 100),
    Buffer.alloc(2 * 2 * 4, 240),
  ]);
  const animated = await sharp(frames, {
    raw: { width: 2, height: 4, channels: 4, pageHeight: 2 },
  })
    .gif({ delay: [100, 100], loop: 0 })
    .toBuffer();
  assert.equal((await sharp(animated).metadata()).pages, 2);
  await assert.rejects(optimizeImage(animated, "animated.gif"), /animación/);
});

test("filenames cannot escape Storage paths or inject response headers", () => {
  assert.equal(webpFilename("../../a\\foto.png"), "foto.webp");
  assert.equal(
    webpFilename('"\r\nX-Injected: true.jpg'),
    "X-Injected-true.webp",
  );
});

test("SSRF blocks private, loopback, link-local, mapped and special IP addresses", () => {
  for (const address of [
    "127.0.0.1",
    "10.0.0.1",
    "172.16.2.3",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "::1",
    "fc00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
    "2001:db8::1",
    "64:ff9b::a00:1",
  ]) {
    assert.equal(isPublicAddress(address), false, address);
  }
  assert.equal(isPublicAddress("1.1.1.1"), true);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
});

test("URL imports accept only public HTTPS without credentials or custom ports", () => {
  for (const url of [
    "http://example.com/image.png",
    "file:///etc/passwd",
    "data:image/png;base64,a",
    "https://127.1/a",
    "https://2130706433/a",
    "https://user:pass@example.com/a",
    "https://example.com:8443/a",
    "https://studio.local/a",
    "https://localhost/a",
    "https://[::1]/a",
  ]) {
    assert.throws(() => parseImageUrl(url), Error, url);
  }
  assert.equal(
    parseImageUrl("https://example.com/photo.png?token=abc").hostname,
    "example.com",
  );
});

test("remote downloads reject internal destinations before any connection", async () => {
  await assert.rejects(downloadImage("https://127.0.0.1/private.png"));
  await assert.rejects(
    downloadImage("https://localhost.localdomain/private.png"),
  );
});

test("body limit applies even when Content-Length is absent", async () => {
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(MAX_MEDIA_BYTES + 20_000));
      controller.close();
    },
  });
  const request = new Request("https://leyer.test/api/media/prepare", {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data; boundary=test" },
    body,
    duplex: "half",
  } as RequestInit);
  await assert.rejects(readMediaForm(request), /25 MB/);
});

test("same-origin protection rejects missing and cross-site origins", () => {
  assert.throws(() =>
    assertSameOrigin(new Request("https://leyer.test/api/media/prepare")),
  );
  assert.throws(() =>
    assertSameOrigin(
      new Request("https://leyer.test/api/media/prepare", {
        headers: { Origin: "https://other.test" },
      }),
    ),
  );
  assert.doesNotThrow(() =>
    assertSameOrigin(
      new Request("https://leyer.test/api/media/prepare", {
        headers: { Origin: "https://leyer.test" },
      }),
    ),
  );
});

test("file and URL inputs cannot be combined ambiguously", async () => {
  const form = new FormData();
  form.set("url", "https://example.com/test.png");
  form.set("file", new File(["test"], "test.png"));
  await assert.rejects(
    readImageSource(form, new AbortController().signal),
    /una opción/,
  );
});
