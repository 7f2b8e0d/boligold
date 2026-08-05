import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'assets', 'crops');
fs.mkdirSync(outDir, { recursive: true });

const skus = [
  'BLHJ-001', 'BLHJ-003', 'BLHJ-005', 'BLHJ-005A', 'BLHJ-101',
  'BLHJ-102', 'BLHJ-103', 'BLHJ-1031', 'BLHJ-1032', 'BLHJ-1250',
  'BLHJ-1270', 'BLHJ-201', 'BLHJ-201p', 'BLHJ-202', 'BLHJ-203',
  'BLHJ-303-clear', 'BLHJ-303-black', 'BLHJ-3051', 'BLHJ-3052', 'BLHJ-501',
  'BLHJ-502', 'BLHJ-503', 'BLHJ-1435', 'YZ-202', 'YZ-003',
];

async function findWhitePanelTop(file) {
  const { data, info } = await sharp(file)
    .resize({ width: 800, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  let lastBlack = h - 1;

  for (let y = h - 1; y >= Math.floor(h * 0.45); y--) {
    let white = 0;
    let black = 0;
    const step = 4;
    let n = 0;
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * ch;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum > 210) white++;
      else if (lum < 50) black++;
      n++;
    }
    const whiteRatio = white / n;
    const blackRatio = black / n;
    if (blackRatio > 0.55 && whiteRatio < 0.15) {
      lastBlack = y;
      break;
    }
  }

  // Map back to full-res ratio (+ small padding)
  return Math.min(0.92, (lastBlack + 4) / h);
}

async function run() {
  for (let i = 0; i < skus.length; i++) {
    const candidates = [
      path.join(root, `assets/products/image${i + 1}.jpeg`),
      path.join(root, `assets/products/image${i + 1}.jpg`),
      path.join(root, `assets/products/image${i + 1}.png`),
    ];
    const src = candidates.find((p) => fs.existsSync(p));
    if (!src) {
      console.warn('missing', skus[i]);
      continue;
    }

    const meta = await sharp(src).metadata();
    let ratio = 0.78;
    try {
      ratio = await findWhitePanelTop(src);
    } catch (e) {
      console.warn('detect fail', skus[i], e.message);
    }

    const cropH = Math.max(200, Math.floor(meta.height * ratio));
    const dest = path.join(outDir, `${skus[i]}.jpg`);

    // Crop white panel; cover top-right logo with black patch for cleaner AI refs
    const logoW = Math.floor(meta.width * 0.22);
    const logoH = Math.floor(cropH * 0.18);
    const overlay = await sharp({
      create: {
        width: logoW,
        height: logoH,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();

    await sharp(src)
      .extract({ left: 0, top: 0, width: meta.width, height: cropH })
      .composite([{ input: overlay, top: Math.floor(cropH * 0.04), left: meta.width - logoW - Math.floor(meta.width * 0.03) }])
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(dest);

    console.log('cropped', skus[i], `ratio=${ratio.toFixed(3)}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
