import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');

// Move options.html from src/options/ to dist/
const optionsHtmlSrc = path.join(distDir, 'src', 'options', 'options.html');
const optionsHtmlDest = path.join(distDir, 'options.html');
if (fs.existsSync(optionsHtmlSrc)) {
  fs.copyFileSync(optionsHtmlSrc, optionsHtmlDest);
  console.log('✓ Moved options.html to dist/');
}

// Copy popup.css to dist/
const popupCssSrc = path.join(__dirname, 'src', 'content', 'popup.css');
const popupCssDest = path.join(distDir, 'popup.css');
if (fs.existsSync(popupCssSrc)) {
  fs.copyFileSync(popupCssSrc, popupCssDest);
  console.log('✓ Copied popup.css to dist/');
}

// Copy manifest.json to dist/
const manifestSrc = path.join(__dirname, 'manifest.json');
const manifestDest = path.join(distDir, 'manifest.json');
if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest);
  console.log('✓ Copied manifest.json to dist/');
}

// Clean up src folder in dist
const srcDir = path.join(distDir, 'src');
if (fs.existsSync(srcDir)) {
  fs.rmSync(srcDir, { recursive: true, force: true });
  console.log('✓ Cleaned up src folder from dist/');
}

// Clean up assets folder (Vite creates this but we don't need it for extensions)
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.rmSync(assetsDir, { recursive: true, force: true });
  console.log('✓ Cleaned up assets folder from dist/');
}

console.log('\n✓ Build completed successfully! Extension is ready in dist/');
