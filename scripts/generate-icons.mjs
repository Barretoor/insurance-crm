import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const ACCENT = "#2f6fe0";

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="108" fill="${ACCENT}" />
  <path
    d="M256 96 L372 134 V262 C372 344 322 400 256 428 C190 400 140 344 140 262 V134 Z"
    fill="#ffffff"
  />
  <path
    d="M196 264 L240 308 L322 202"
    fill="none"
    stroke="${ACCENT}"
    stroke-width="30"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
`;

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon.svg", svg.trim());

const targets = [
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "public/icons/apple-touch-icon.png", size: 180 },
  { file: "public/icons/icon-maskable-512.png", size: 512, maskable: true },
];

for (const t of targets) {
  const pipeline = sharp(Buffer.from(svg)).resize(t.size, t.size);
  if (t.maskable) {
    // Maskable icons need the glyph within a centered ~80% safe zone -
    // render smaller onto a full-bleed accent background so OS masks
    // (circle, squircle, etc.) never clip the shield/checkmark.
    const inner = Math.round(t.size * 0.7);
    const offset = Math.round((t.size - inner) / 2);
    const glyph = await sharp(Buffer.from(svg)).resize(inner, inner).toBuffer();
    await sharp({
      create: {
        width: t.size,
        height: t.size,
        channels: 4,
        background: ACCENT,
      },
    })
      .composite([{ input: glyph, left: offset, top: offset }])
      .png()
      .toFile(t.file);
  } else {
    await pipeline.png().toFile(t.file);
  }
  console.log("wrote", t.file);
}
