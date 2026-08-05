import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outWeb = path.join(root, 'assets', 'web');

const jobs = [
  // Optimized AI assets from cursor projects folder
  {
    src: 'C:/Users/xiaodou/.cursor/projects/c-Users-xiaodou-Desktop-boligold/assets/hero-opt.jpg',
    out: 'hero.jpg',
    w: 1920,
    q: 82,
  },
  {
    src: 'C:/Users/xiaodou/.cursor/projects/c-Users-xiaodou-Desktop-boligold/assets/factory-opt.jpg',
    out: 'factory.jpg',
    w: 1600,
    q: 80,
  },
  {
    src: 'C:/Users/xiaodou/.cursor/projects/c-Users-xiaodou-Desktop-boligold/assets/showroom-opt.jpg',
    out: 'showroom.jpg',
    w: 1600,
    q: 80,
  },
  {
    src: 'C:/Users/xiaodou/.cursor/projects/c-Users-xiaodou-Desktop-boligold/assets/building-opt.jpg',
    out: 'building.jpg',
    w: 1600,
    q: 80,
  },
  {
    src: path.join(root, 'assets/company/office.jpg'),
    out: 'office.jpg',
    w: 1400,
    q: 80,
  },
  {
    src: path.join(root, 'assets/company/product-clearboxes.jpg'),
    out: 'clearboxes.jpg',
    w: 1200,
    q: 82,
  },
  {
    src: path.join(root, 'assets/company/showroom-products.jpg'),
    out: 'showroom-products.jpg',
    w: 1200,
    q: 80,
  },
  {
    src: path.join(root, 'assets/logos/logo-zh-opt.png'),
    out: 'logo-zh.png',
    w: 480,
    q: 90,
    png: true,
  },
  {
    src: path.join(root, 'assets/logos/logo-en-opt.png'),
    out: 'logo-en.png',
    w: 480,
    q: 90,
    png: true,
  },
  {
    src: path.join(root, 'assets/logos/logo-zh.png'),
    out: 'logo-zh-mark.png',
    w: 200,
    q: 90,
    png: true,
  },
  {
    src: path.join(root, 'assets/logos/logo-en.png'),
    out: 'logo-en-mark.png',
    w: 200,
    q: 90,
    png: true,
  },
];

// Product images — excel order maps to image1..image25 (approx)
const skus = [
  'BLHJ-001', 'BLHJ-003', 'BLHJ-005', 'BLHJ-005A', 'BLHJ-101',
  'BLHJ-102', 'BLHJ-103', 'BLHJ-1031', 'BLHJ-1032', 'BLHJ-1250',
  'BLHJ-1270', 'BLHJ-201', 'BLHJ-201p', 'BLHJ-202', 'BLHJ-203',
  'BLHJ-303-clear', 'BLHJ-303-black', 'BLHJ-3051', 'BLHJ-3052', 'BLHJ-501',
  'BLHJ-502', 'BLHJ-503', 'BLHJ-1435', 'YZ-202', 'YZ-003',
];

fs.mkdirSync(path.join(outWeb, 'products'), { recursive: true });

async function run() {
  for (const j of jobs) {
    if (!fs.existsSync(j.src)) {
      console.warn('skip missing', j.src);
      continue;
    }
    const dest = path.join(outWeb, j.out);
    let pipeline = sharp(j.src).resize({ width: j.w, withoutEnlargement: true });
    if (j.png) {
      await pipeline.png({ quality: j.q, compressionLevel: 9 }).toFile(dest);
    } else {
      await pipeline.jpeg({ quality: j.q, mozjpeg: true }).toFile(dest);
    }
    console.log('ok', j.out);
  }

  for (let i = 0; i < skus.length; i++) {
    const candidates = [
      path.join(root, `assets/products/image${i + 1}.jpeg`),
      path.join(root, `assets/products/image${i + 1}.jpg`),
      path.join(root, `assets/products/image${i + 1}.png`),
    ];
    const src = candidates.find((p) => fs.existsSync(p));
    if (!src) {
      console.warn('no product image', skus[i]);
      continue;
    }
    const dest = path.join(outWeb, 'products', `${skus[i]}.jpg`);
    await sharp(src)
      .resize({ width: 900, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(dest);
    console.log('product', skus[i]);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
