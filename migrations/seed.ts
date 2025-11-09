// Initial seed file for Super Admin, roles, modules (TypeORM)
// Run with: npx ts-node migrations/seed.ts
// DO NOT import this file in your application code - it will cause conflicts

import { AppDataSource } from '../src/config/data-source';

export async function seed() {
  try {
    // Check if DataSource is already initialized (e.g., if called from running server)
    if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('✅ Database connected for seeding');
    } else {
      console.log('✅ Using existing database connection');
    }

    // TODO: Add seed logic here
    // - Create Super Admin user
    // - Create base roles
    // - Create modules
    // - Create subscription plans

    console.log('✅ Seeding completed');
    
    // Only destroy if we initialized it ourselves
    if (AppDataSource.isInitialized && !process.env.KEEP_CONNECTION) {
    await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Only run seed if this file is executed directly (not imported)
// Check both CommonJS and ESM module patterns
const isMainModule = 
  require.main === module || 
  (typeof require !== 'undefined' && require.main?.filename === __filename) ||
  process.argv[1]?.endsWith('seed.ts') ||
  process.argv[1]?.endsWith('seed.js');

if (isMainModule) {
  seed().catch((error) => {
    console.error('❌ Fatal error during seeding:', error);
    process.exit(1);
  });
}

