import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runSeeders() {
  const seedPath = path.join(__dirname, 'seeds');
  const files = fs.readdirSync(seedPath)
    .filter(file => file.match(/^\d+_.*\.js$/))
    .sort();

  for (const file of files) {
    console.log(`🌱 Ejecutando seeder: ${file}`);
    const fileURL = pathToFileURL(path.join(seedPath, file));
    const seederModule = await import(fileURL.href);

    if (typeof seederModule.default === 'function') {
      await seederModule.default();
    } else {
      console.warn(`⚠️  ${file} no exporta una función por defecto.`);
    }
  }

  console.log('✅ Todos los seeders ejecutados');
}
