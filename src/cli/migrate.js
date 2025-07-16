import migrate from '../database/migrate.js';
await migrate();
process.exit(0);