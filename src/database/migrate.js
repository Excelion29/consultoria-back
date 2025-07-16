import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import db from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.migration.js'))
    .sort();

  const [rows] = await db.query('SELECT name FROM migrations');
  const applied = rows.map(r => r.name);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const migrationModule = await import(pathToFileURL(filePath).href);
    const migration = migrationModule.default;

    if (!migration?.up || typeof migration.up !== 'function') {
      console.warn(`⚠️  Migración inválida: ${file}`);
      continue;
    }

    if (applied.includes(migration.name)) {
      console.log(`⏭️  ${migration.name} ya aplicada`);
      continue;
    }

    console.log(`🔧 Aplicando: ${migration.name}`);
    await migration.up(db);
    await db.query('INSERT INTO migrations (name) VALUES (?)', [migration.name]);
  }

  console.log('✅ Migraciones completadas');
}
