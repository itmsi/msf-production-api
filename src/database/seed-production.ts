import { DataSource } from 'typeorm';
import { ProductionSeeder } from './seeders/production-seeder';
import { config } from 'dotenv';
import { CustomRolesUsersSeeder } from './seeders/custom-roles-users.seeder';

// Load environment variables
config();

async function seedProduction() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('🔌 Database connection established');

    const productionSeeder = new ProductionSeeder(dataSource);
    await productionSeeder.run();

    // Run custom roles/users seeder
    const customRolesUsersSeeder = new CustomRolesUsersSeeder(dataSource);
    await customRolesUsersSeeder.run();
  } catch (error) {
    console.error('❌ Production Module seeding failed:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  seedProduction();
}
