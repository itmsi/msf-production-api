import { DataSource } from 'typeorm';

export class UnitVariantSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const unitVariantRepository = this.dataSource.getRepository('m_unit_variant');

    const unitVariantsData = [
      {
        name: 'Excavator Mini',
        description: 'Small excavator for tight spaces',
        unit_type_id: 1, // Excavator
        brand: 'Komatsu',
        model: 'PC30',
        capacity: '3 ton',
        year: 2020,
        isActive: true,
      },
      {
        name: 'Excavator Medium',
        description: 'Medium size excavator',
        unit_type_id: 1, // Excavator
        brand: 'Hitachi',
        model: 'ZX200',
        capacity: '20 ton',
        year: 2019,
        isActive: true,
      },
      {
        name: 'Excavator Large',
        description: 'Large excavator for heavy work',
        unit_type_id: 1, // Excavator
        brand: 'Caterpillar',
        model: '320D',
        capacity: '20 ton',
        year: 2018,
        isActive: true,
      },
      {
        name: 'Bulldozer D6',
        description: 'Medium bulldozer',
        unit_type_id: 2, // Bulldozer
        brand: 'Caterpillar',
        model: 'D6',
        capacity: '15 ton',
        year: 2019,
        isActive: true,
      },
      {
        name: 'Crane Mobile',
        description: 'Mobile crane for construction',
        unit_type_id: 3, // Crane
        brand: 'Liebherr',
        model: 'LTM 1100',
        capacity: '100 ton',
        year: 2020,
        isActive: true,
      },
      {
        name: 'Truck Dump',
        description: 'Dump truck for material transport',
        unit_type_id: 4, // Truck
        brand: 'Hino',
        model: '500',
        capacity: '10 ton',
        year: 2019,
        isActive: true,
      },
      {
        name: 'Loader Wheel',
        description: 'Wheel loader for loading operations',
        unit_type_id: 5, // Loader
        brand: 'Volvo',
        model: 'L120',
        capacity: '2.5 ton',
        year: 2020,
        isActive: true,
      },
      {
        name: 'Generator Diesel',
        description: 'Diesel powered generator',
        unit_type_id: 6, // Generator
        brand: 'Perkins',
        model: '1103C',
        capacity: '50 kVA',
        year: 2019,
        isActive: true,
      },
    ];

    for (const unitVariantData of unitVariantsData) {
      const existingUnitVariant = await unitVariantRepository.findOne({
        where: { 
          name: unitVariantData.name,
          model: unitVariantData.model 
        },
      });

      if (!existingUnitVariant) {
        const unitVariant = unitVariantRepository.create(unitVariantData);
        await unitVariantRepository.save(unitVariant);
        console.log(`✅ Unit Variant "${unitVariantData.name} - ${unitVariantData.model}" created`);
      } else {
        console.log(`⏭️  Unit Variant "${unitVariantData.name} - ${unitVariantData.model}" already exists`);
      }
    }
  }
}
