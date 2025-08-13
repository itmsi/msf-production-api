import { DataSource } from 'typeorm';

export class EngineBrandSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const engineBrandRepository = this.dataSource.getRepository('m_engine_brand');

    const engineBrandsData = [
      {
        name: 'Caterpillar',
        serial_engine: 'CAT-001',
      },
      {
        name: 'Komatsu',
        serial_engine: 'KOM-001',
      },
      {
        name: 'Hitachi',
        serial_engine: 'HIT-001',
      },
      {
        name: 'Volvo',
        serial_engine: 'VOL-001',
      },
      {
        name: 'Liebherr',
        serial_engine: 'LIE-001',
      },
    ];

    for (const brandData of engineBrandsData) {
      const existingBrand = await engineBrandRepository.findOne({
        where: { name: brandData.name },
      });

      if (!existingBrand) {
        const engineBrand = engineBrandRepository.create(brandData);
        await engineBrandRepository.save(engineBrand);
        console.log(`✅ Engine Brand "${brandData.name}" created`);
      } else {
        console.log(`⏭️  Engine Brand "${brandData.name}" already exists`);
      }
    }
  }
}
