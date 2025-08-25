import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import PlanWorkingHourSeeder from './seeders/plan-working-hour.seeder';

// Load environment variables
config();

async function seedPlanWorkingHour() {
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

    const seeder = new PlanWorkingHourSeeder();
    await seeder.run(dataSource);

    console.log('✅ Plan Working Hour seeding completed');
  } catch (error) {
    console.error('❌ Plan Working Hour Seeding failed:', error);
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
  seedPlanWorkingHour();
}
