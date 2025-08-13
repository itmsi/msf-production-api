import { DataSource } from 'typeorm';

export class UnitTypeSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const unitTypeRepository = this.dataSource.getRepository('m_unit_type');

    const unitTypesData = [
      {
        unit_name: 'Excavator',
        type_name: 'Heavy Equipment',
        model_name: 'PC200',
        brand_id: 1, // Komatsu
      },
      {
        unit_name: 'Bulldozer',
        type_name: 'Heavy Equipment',
        model_name: 'D65',
        brand_id: 1, // Komatsu
      },
      {
        unit_name: 'Crane',
        type_name: 'Lifting Equipment',
        model_name: 'CC2500',
        brand_id: 2, // Caterpillar
      },
      {
        unit_name: 'Truck',
        type_name: 'Transport',
        model_name: 'HD785',
        brand_id: 1, // Komatsu
      },
      {
        unit_name: 'Loader',
        type_name: 'Heavy Equipment',
        model_name: 'WA380',
        brand_id: 1, // Komatsu
      },
      {
        unit_name: 'Generator',
        type_name: 'Power Equipment',
        model_name: 'G120',
        brand_id: 3, // Hitachi
      },
      {
        unit_name: 'Compressor',
        type_name: 'Power Equipment',
        model_name: 'C185',
        brand_id: 2, // Caterpillar
      },
      {
        unit_name: 'Welding Machine',
        type_name: 'Tools',
        model_name: 'W200',
        brand_id: 4, // Volvo
      },
      {
        unit_name: 'Excavator Mini',
        type_name: 'Heavy Equipment',
        model_name: 'PC78',
        brand_id: 1, // Komatsu
      },
      {
        unit_name: 'Dump Truck',
        type_name: 'Transport',
        model_name: 'HD465',
        brand_id: 1, // Komatsu
      },
    ];

    for (const unitTypeData of unitTypesData) {
      const existingUnitType = await unitTypeRepository.findOne({
        where: { unit_name: unitTypeData.unit_name },
      });

      if (!existingUnitType) {
        const unitType = unitTypeRepository.create(unitTypeData);
        await unitTypeRepository.save(unitType);
        console.log(`✅ Unit Type "${unitTypeData.unit_name}" created`);
      } else {
        console.log(`⏭️  Unit Type "${unitTypeData.unit_name}" already exists`);
      }
    }
  }
}
