import { DataSource } from 'typeorm';
import { CompleteSeeder } from './seeders/complete-seeder';

async function seedComplete() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'falaqmsi',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DB || 'tid-project-mix',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Jalankan seeder
    console.log('🌱 Starting seeding process...');
    const completeSeeder = new CompleteSeeder(dataSource);
    await completeSeeder.run();

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Jalankan seeder jika file ini dijalankan langsung
if (require.main === module) {
  seedComplete()
    .then(() => {
      console.log('🎯 Seed complete process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed complete process failed:', error);
      process.exit(1);
    });
}

export default seedComplete;
