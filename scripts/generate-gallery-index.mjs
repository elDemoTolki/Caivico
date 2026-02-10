#!/usr/bin/env node

// Script Node.js para generar assets/gallery.json
// Lee la carpeta assets/ y genera un JSON ordenado con rutas de gallery<number>.jpg

import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(process.cwd());
const assetsDir = path.join(projectRoot, 'assets');
const outFile = path.join(assetsDir, 'gallery.json');

function run(){
  if(!fs.existsSync(assetsDir)){
    console.error('Carpeta assets/ no encontrada:', assetsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(assetsDir);
  const items = files
    .filter(f => /^gallery\d+\.jpg$/i.test(f))
    .map(f => ({ name: f, num: parseInt(f.match(/gallery(\d+)\.jpg/i)[1], 10) }))
    .sort((a,b) => a.num - b.num)
    // Escribir rutas absolutas para evitar problemas desde subrutas (/galeria/)
    .map(i => `/assets/${i.name}`);

  const data = { timestamp: new Date().toISOString(), total: items.length, images: items };
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
  console.log(`Se generó ${path.relative(projectRoot, outFile)} con ${items.length} imágenes`);
}

run();
