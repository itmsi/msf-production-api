import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

export class BrandSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const brandRepository = this.dataSource.getRepository('m_brand');

    const brands = [
      {
        brand_name: 'Komatsu',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        brand_name: 'Caterpillar',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        brand_name: 'Hitachi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        brand_name: 'Volvo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        brand_name: 'Liebherr',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    try {
      // Check if brands already exist
      const existingBrands = await brandRepository.find();
      if (existingBrands.length > 0) {
        console.log('   ⚠️  Brands already exist, skipping...');
        return;
      }

      // Insert brands
      await brandRepository.save(brands);
      console.log(`   ✅ Inserted ${brands.length} brands`);
    } catch (error) {
      console.error('   ❌ Error seeding brands:', error);
      throw error;
    }
  }
}
