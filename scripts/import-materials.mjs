import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcRoot = 'C:/Users/xiaodou/Desktop/网站产品素材';
const web = path.join(root, 'assets', 'web');

const dirs = {
  ps: path.join(web, 'products', 'ps'),
  pet: path.join(web, 'products', 'pet'),
  pp: path.join(web, 'products', 'pp'),
  acc: path.join(web, 'products', 'accessories'),
  scenes: path.join(web, 'scenes'),
};

Object.values(dirs).forEach((d) => fs.mkdirSync(d, { recursive: true }));

async function findWhitePanelTop(file) {
  const { data, info } = await sharp(file)
    .resize({ width: 700, withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  for (let y = h - 1; y >= Math.floor(h * 0.45); y--) {
    let white = 0;
    let black = 0;
    let n = 0;
    for (let x = 0; x < w; x += 4) {
      const i = (y * w + x) * ch;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum > 210) white++;
      else if (lum < 50) black++;
      n++;
    }
    if (black / n > 0.5 && white / n < 0.18) return Math.min(0.9, (y + 2) / h);
  }
  return 1;
}

async function toWebJpeg(src, dest, { width = 1100, quality = 84, cropBar = false, coverLogo = false } = {}) {
  let pipeline = sharp(src).rotate();
  const meta = await sharp(src).metadata();

  if (cropBar && meta.height > 800) {
    const ratio = await findWhitePanelTop(src);
    if (ratio < 0.95) {
      const cropH = Math.floor(meta.height * ratio);
      pipeline = sharp(src).extract({ left: 0, top: 0, width: meta.width, height: cropH });
      if (coverLogo) {
        const logoW = Math.floor(meta.width * 0.2);
        const logoH = Math.floor(cropH * 0.16);
        const overlay = await sharp({
          create: { width: logoW, height: logoH, channels: 3, background: { r: 0, g: 0, b: 0 } },
        })
          .png()
          .toBuffer();
        pipeline = pipeline.composite([
          {
            input: overlay,
            top: Math.floor(cropH * 0.03),
            left: meta.width - logoW - Math.floor(meta.width * 0.025),
          },
        ]);
      }
    }
  }

  await pipeline
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toFile(dest);
}

function pickFirst(dir, names) {
  for (const n of names) {
    const p = path.join(dir, n);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const psSpecs = {
  '001': { id: 'BLHJ-001', size: '95×95×65', weight: '56g', qty: 168, note: 'frosted', shape: 'square' },
  '003': { id: 'BLHJ-003', size: '108×108×58', weight: '64g', qty: 160, note: '', shape: 'square' },
  '005': { id: 'BLHJ-005', size: '77×77×63', weight: '37g', qty: 280, note: '', shape: 'square' },
  '005A': { id: 'BLHJ-005A', size: '85×85×80', weight: '45g', qty: 210, note: 'white', shape: 'square' },
  '101': { id: 'BLHJ-101', size: '154×76×65', weight: '55g', qty: 140, note: '', shape: 'rect' },
  '102': { id: 'BLHJ-102', size: '145×82×53', weight: '62g', qty: 160, note: 'frosted', shape: 'rect' },
  '103': { id: 'BLHJ-103', size: '147×90×50', weight: '65g', qty: 180, note: '', shape: 'rect' },
  '1031': { id: 'BLHJ-1031', size: '144×103×59', weight: '80g', qty: 128, note: 'frosted', shape: 'rect' },
  '1032': { id: 'BLHJ-1032', size: '144×103×59', weight: '80g', qty: 128, note: 'frosted', shape: 'rect' },
  '1250': { id: 'BLHJ-1250', size: '120×63×50', weight: '42g', qty: 270, note: 'frosted', shape: 'rect' },
  '1270': { id: 'BLHJ-1270', size: '120×63×70', weight: '50g', qty: 180, note: 'frosted', shape: 'rect' },
  '1435': { id: 'BLHJ-1435', size: '140×35', weight: '72g', qty: 168, note: '', shape: 'round' },
  '201': { id: 'BLHJ-201', size: '120×53', weight: '46g', qty: 135, note: '', shape: 'round' },
  '201+': { id: 'BLHJ-201+', size: '120×55', weight: '50g', qty: 135, note: '', shape: 'round' },
  '202': { id: 'BLHJ-202', size: '140×60', weight: '61g', qty: 120, note: 'frosted', shape: 'round' },
  '203': { id: 'BLHJ-203', size: '100×60', weight: '41g', qty: 192, note: 'frosted', shape: 'round' },
  '303': { id: 'BLHJ-303', size: '65×55×95', weight: '33g', qty: 288, note: 'clear-lid', shape: 'tall' },
  '303黑': { id: 'BLHJ-303B', size: '65×55×95', weight: '33g', qty: 288, note: 'black-lid', shape: 'tall' },
  '3051': { id: 'BLHJ-3051', size: '85×85×63', weight: '42g', qty: 210, note: '', shape: 'square' },
  '3052': { id: 'BLHJ-3052', size: '83×83×65', weight: '45g', qty: 210, note: 'frosted', shape: 'square' },
  '501': { id: 'BLHJ-501', size: '140×50', weight: '73g', qty: 120, note: 'frosted', shape: 'round' },
  '502': { id: 'BLHJ-502', size: '183×120×26', weight: '82g', qty: 120, note: '', shape: 'flat' },
  '503': { id: 'BLHJ-503', size: '183×183×36', weight: '131g', qty: 64, note: 'frosted', shape: 'flat' },
};

async function importPS() {
  const whiteDir = path.join(srcRoot, '聚苯乙烯PS材质/纯白底图');
  const photoDir = path.join(srcRoot, '聚苯乙烯PS材质/产品照片');
  const products = [];

  for (const [key, spec] of Object.entries(psSpecs)) {
    const safe = spec.id.replace('+', 'p');
    const studio = pickFirst(photoDir, [
      `${spec.id}-1.png`,
      `${spec.id}-2.png`,
      `${spec.id}-3.png`,
      `${spec.id}-4.png`,
      `YZ-202-3.png`,
    ].filter((n) => (spec.id === 'YZ-202' ? n.includes('YZ') : n.startsWith(spec.id))));

    // Prefer studio named PNG; else white bg; else numbered catalog jpg (crop bar)
    let src =
      pickFirst(photoDir, [`${spec.id}-1.png`, `${spec.id}-2.png`]) ||
      pickFirst(whiteDir, [`${key}.jpg`, `${key}.png`]) ||
      pickFirst(photoDir, [`${key}.jpg`, `${key}.png`]);

    // Special: YZ from studio
    if (spec.id.startsWith('YZ')) {
      src = pickFirst(photoDir, ['YZ-202-3.png']) || src;
    }

    if (!src) {
      console.warn('PS missing', spec.id);
      continue;
    }

    const dest = path.join(dirs.ps, `${safe}.jpg`);
    const isCatalogBlack = /\\产品照片\\/.test(src) && /\.(jpg|jpeg)$/i.test(src) && !/BLHJ-|YZ-/.test(path.basename(src));
    await toWebJpeg(src, dest, {
      width: 1200,
      quality: 86,
      cropBar: isCatalogBlack,
      coverLogo: isCatalogBlack,
    });
    products.push({
      ...spec,
      category: 'ps',
      img: `assets/web/products/ps/${safe}.jpg`,
    });
    console.log('PS', spec.id, '←', path.basename(src));
  }

  // YZ products from white/studio if present
  const yz202 = pickFirst(photoDir, ['YZ-202-3.png']);
  if (yz202) {
    await toWebJpeg(yz202, path.join(dirs.ps, 'YZ-202.jpg'), { width: 1200, quality: 86 });
    products.push({
      id: 'YZ-202',
      size: '140×94',
      weight: '76g',
      qty: 90,
      note: '',
      shape: 'rect',
      category: 'ps',
      img: 'assets/web/products/ps/YZ-202.jpg',
    });
    console.log('PS YZ-202');
  }

  const yz003White = pickFirst(whiteDir, ['YZ-003.jpg']);
  // keep from previous if no white
  if (!products.find((p) => p.id === 'YZ-003')) {
    const prev = path.join(web, 'products', 'YZ-003.jpg');
    if (fs.existsSync(prev)) {
      fs.copyFileSync(prev, path.join(dirs.ps, 'YZ-003.jpg'));
      products.push({
        id: 'YZ-003',
        size: '108×108×58',
        weight: '63g',
        qty: 160,
        note: 'frosted',
        shape: 'square',
        category: 'ps',
        img: 'assets/web/products/ps/YZ-003.jpg',
      });
    }
  }

  return products;
}

async function importPET() {
  const dir = path.join(srcRoot, 'PET材质/产品照片');
  const files = fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)).sort();
  const specs = [
    { id: 'PET-01', size: '130×50', weight: '', qty: 200, note: '', shape: 'round' },
    { id: 'PET-1455', size: '140×50', weight: '', qty: 140, note: '', shape: 'round' },
    { id: 'PET-2130', size: '215×150×31', weight: '', qty: 120, note: '', shape: 'flat' },
    { id: 'PET-2530', size: '254×183×32', weight: '', qty: 90, note: '', shape: 'flat' },
  ];
  const products = [];
  for (let i = 0; i < files.length && i < specs.length; i++) {
    const dest = path.join(dirs.pet, `${specs[i].id}.jpg`);
    await toWebJpeg(path.join(dir, files[i]), dest, { width: 1200, quality: 86, cropBar: true, coverLogo: true });
    products.push({ ...specs[i], category: 'pet', img: `assets/web/products/pet/${specs[i].id}.jpg` });
    console.log('PET', specs[i].id, '←', files[i]);
  }
  return products;
}

async function importPP() {
  const dir = path.join(srcRoot, 'PP材质/产品照片');
  const files = fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)).sort();
  // pp0 = set with bar BLHJ-1090; pp1 = stacked lifestyle; pp2 = packing overlay; pp3 = dimension shot
  const products = [
    {
      id: 'BLHJ-1090',
      size: '90×85×100',
      weight: '650ml',
      qty: 400,
      note: '',
      shape: 'square',
      category: 'pp',
      img: 'assets/web/products/pp/BLHJ-1090.jpg',
      colors: true,
    },
  ];

  // Use cleanest product shot: prefer stacked set (file index 1) or first
  const main = files.find((f) => f.includes('97')) || files[1] || files[0];
  await toWebJpeg(path.join(dir, main), path.join(dirs.pp, 'BLHJ-1090.jpg'), {
    width: 1200,
    quality: 86,
    cropBar: /81_2001/.test(main),
    coverLogo: false,
  });
  console.log('PP BLHJ-1090 ←', main);

  // Extra gallery variants as separate SKUs if they look distinct
  const dim = files.find((f) => f.includes('99'));
  if (dim) {
    await toWebJpeg(path.join(dir, dim), path.join(dirs.pp, 'BLHJ-1090-size.jpg'), { width: 1000, quality: 85 });
  }

  return products;
}

async function importAccessories() {
  const dir = path.join(srcRoot, '辅助产品');
  const files = fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)).sort();
  const names = [
    { id: 'SEAL-01', titleKey: 'acc_seal_bw' },
    { id: 'SEAL-02', titleKey: 'acc_seal_set' },
    { id: 'SEAL-03', titleKey: 'acc_seal_roll' },
    { id: 'SEAL-04', titleKey: 'acc_seal_custom' },
    { id: 'SEAL-05', titleKey: 'acc_seal_pack' },
  ];
  const products = [];
  for (let i = 0; i < files.length; i++) {
    const meta = names[i] || { id: `ACC-${i + 1}`, titleKey: 'acc_generic' };
    const dest = path.join(dirs.acc, `${meta.id}.jpg`);
    await toWebJpeg(path.join(dir, files[i]), dest, { width: 1100, quality: 85 });
    products.push({
      id: meta.id,
      size: '—',
      weight: '—',
      qty: '—',
      note: '',
      shape: 'accessory',
      category: 'accessories',
      titleKey: meta.titleKey,
      img: `assets/web/products/accessories/${meta.id}.jpg`,
    });
    console.log('ACC', meta.id);
  }
  return products;
}

async function importScenes() {
  const picks = [
    ['聚苯乙烯PS材质/盒子使用场景/产品应用场景精修_01.png', 'hero.jpg', 1920],
    ['聚苯乙烯PS材质/盒子使用场景/产品应用场景精修_05.png', 'scene-01.jpg', 1400],
    ['聚苯乙烯PS材质/盒子使用场景/产品应用场景精修_12.png', 'scene-02.jpg', 1400],
    ['聚苯乙烯PS材质/盒子使用场景/产品应用场景精修_18.png', 'scene-03.jpg', 1400],
    ['聚苯乙烯PS材质/盒子使用场景/产品应用场景精修_28.png', 'scene-04.jpg', 1400],
    ['聚苯乙烯PS材质/盒子使用场景/产品应用场景精修_36.png', 'scene-05.jpg', 1400],
    ['PET材质/使用场景/产品应用场景精修_20.png', 'scene-pet-01.jpg', 1400],
    ['PET材质/使用场景/产品应用场景精修_39.png', 'scene-pet-02.jpg', 1400],
    ['PP材质/使用场景/微信图片_20260805103523_103_2001.jpg', 'scene-pp-01.jpg', 1200],
    ['PP材质/使用场景/微信图片_20260805103711_106_2001.jpg', 'scene-pp-02.jpg', 1200],
    ['聚苯乙烯PS材质/盒子使用场景/产品应用场景精修_08.png', 'about-visual.jpg', 1400],
  ];

  for (const [rel, name, w] of picks) {
    const src = path.join(srcRoot, rel);
    if (!fs.existsSync(src)) {
      console.warn('scene missing', rel);
      continue;
    }
    const dest = name.startsWith('hero') || name.startsWith('about')
      ? path.join(web, name)
      : path.join(dirs.scenes, name);
    await toWebJpeg(src, dest, { width: w, quality: 80 });
    console.log('SCENE', name);
  }
}

async function run() {
  const ps = await importPS();
  const pet = await importPET();
  const pp = await importPP();
  const acc = await importAccessories();
  await importScenes();

  const all = [...ps, ...pet, ...pp, ...acc];
  const js = `window.BOLIGOLD_PRODUCTS = ${JSON.stringify(all, null, 2)};\n`;
  fs.writeFileSync(path.join(root, 'js/products.js'), js);
  fs.writeFileSync(path.join(root, 'assets/product-map.json'), JSON.stringify(all, null, 2));
  console.log('\\nDone. Products:', all.length);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
