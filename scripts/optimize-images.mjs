import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

const PUBLIC = 'public';

async function convert(inputPath, quality = 80) {
  const name = basename(inputPath, extname(inputPath));
  const dir = inputPath.substring(0, inputPath.lastIndexOf('\\') === -1 ? inputPath.lastIndexOf('/') : inputPath.lastIndexOf('\\'));
  const outPath = join(dir, `${name}.webp`);

  const info = await sharp(inputPath)
    .webp({ quality })
    .toFile(outPath);

  const origSize = statSync(inputPath).size;
  const saved = ((1 - info.size / origSize) * 100).toFixed(1);
  console.log(`✓ ${inputPath} (${(origSize / 1024).toFixed(0)}KB) → ${outPath} (${(info.size / 1024).toFixed(0)}KB) [${saved}% smaller]`);
}

const targets = [
  join(PUBLIC, 'homepage.png'),
  join(PUBLIC, '1000103078.png'),
];

const themeLogosDir = join(PUBLIC, 'ThemeLogos');
try {
  const logos = readdirSync(themeLogosDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .map(f => join(themeLogosDir, f));
  targets.push(...logos);
} catch { /* no ThemeLogos dir */ }

for (const file of targets) {
  try {
    await convert(file);
  } catch (e) {
    console.error(`✗ ${file}: ${e.message}`);
  }
}

console.log('\nDone! Update your code to reference .webp instead of .png');
