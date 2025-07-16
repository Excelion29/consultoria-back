import runMigrations from '../database/migrate.js';
import runSeeders from '../database/seed.js';

async function runAll() {
  console.log('🚀 Ejecutando migraciones...');
  await runMigrations();

  console.log('\n🌱 Ejecutando seeders...');
  await runSeeders();

  console.log('\n✅ Migraciones y seeders completados');
  process.exit(0); // Siempre finalizar
}

await runAll();
