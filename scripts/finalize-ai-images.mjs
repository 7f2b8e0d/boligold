import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(process.cwd());
const genDir = 'C:/Users/xiaodou/.cursor/projects/c-Users-xiaodou-Desktop-boligold/assets';
const web = path.join(root, 'assets/web');

const products = JSON.parse(fs.readFileSync(path.join(root, 'assets/product-map.json'), 'utf8'));

async function toJpeg(src, out, width, quality) {
  await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality, progressive: true, mozjpeg: true })
    .toFile(out);
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`${path.relative(root, out)}  ${kb} KB`);
}

async function run() {
  await toJpeg(path.join(genDir, 'hero-new.jpg'), path.join(web, 'hero.jpg'), 1920, 82);
  await toJpeg(path.join(genDir, 'factory-new.jpg'), path.join(web, 'factory.jpg'), 1600, 80);

  let ok = 0;
  const missing = [];
  for (const p of products) {
    const src = path.join(genDir, `st-${p.id}.jpg`);
    if (!fs.existsSync(src)) {
      missing.push(p.id);
      continue;
    }
    const out = path.join(root, p.img);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await toJpeg(src, out, 900, 80);
    ok++;
  }
  console.log(`\nProducts done: ${ok}/${products.length}`);
  if (missing.length) console.log('MISSING:', missing.join(', '));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
