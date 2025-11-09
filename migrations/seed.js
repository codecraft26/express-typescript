"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Initial seed file for Super Admin, roles, modules (TypeORM)
// Run with: npx ts-node migrations/seed.ts
const data_source_1 = require("../src/config/data-source");
async function seed() {
    try {
        // Check if DataSource is already initialized (e.g., if called from running server)
        if (!data_source_1.AppDataSource.isInitialized) {
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Database connected for seeding');
        }
        else {
            console.log('✅ Using existing database connection');
        }
        // TODO: Add seed logic here
        // - Create Super Admin user
        // - Create base roles
        // - Create modules
        // - Create subscription plans
        console.log('✅ Seeding completed');
        // Only destroy if we initialized it ourselves
        if (data_source_1.AppDataSource.isInitialized && !process.env.KEEP_CONNECTION) {
        await data_source_1.AppDataSource.destroy();
            console.log('✅ Database connection closed');
        }
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
}
// Only run seed if this file is executed directly (not imported)
if (require.main === module) {
seed();
}
