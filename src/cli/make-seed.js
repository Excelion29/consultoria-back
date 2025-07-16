import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const name = process.argv[2];

if (!name) {
  console.error('❌ Debes proporcionar un nombre para el seeder.');
  process.exit(1);
}

const seedsDir = path.join(__dirname, '../database/seeds');
if (!fs.existsSync(seedsDir)) fs.mkdirSync(seedsDir, { recursive: true });

const files = fs.readdirSync(seedsDir)
  .filter(f => f.match(/^\d+_.*\.js$/))
  .sort();

const nextNumber = (files.length + 1).toString().padStart(3, '0');
const fileName = `${nextNumber}_${name}.js`;
const filePath = path.join(seedsDir, fileName);

const template = `
import db from '../config/db.js';

export default async function () {
  // 👉 Escribe aquí tu lógica para poblar datos en la base de datos
  console.log('✅ Seeder ejecutado: ${fileName}');
}
`;

fs.writeFileSync(filePath, template.trimStart());
console.log(`✅ Seeder creado: ${fileName}`);
