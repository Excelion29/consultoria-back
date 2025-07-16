import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const name = process.argv[2];

if (!name) {
  console.error('❌ Debes ingresar un nombre para la migración.');
  process.exit(1);
}

const migrationsDir = path.join(__dirname, '../database/migrations');
if (!fs.existsSync(migrationsDir)) fs.mkdirSync(migrationsDir, { recursive: true });

const files = fs.readdirSync(migrationsDir)
  .filter(f => f.match(/^\d+_.*\.migration\.js$/))
  .sort();

const nextNumber = (files.length + 1).toString().padStart(3, '0');
const fileName = `${nextNumber}_${name}.migration.js`;
const filePath = path.join(migrationsDir, fileName);

const template = `
export default {
  name: '${fileName.replace('.migration.js', '')}',
  up: async (db) => {
    // Escribe aquí tu SQL
    await db.query(\`
      -- ejemplo:
      -- CREATE TABLE ejemplo (...);
    \`);
  }
};
`;

fs.writeFileSync(filePath, template.trimStart());
console.log(`✅ Migración creada: ${fileName}`);
