import { DataSource } from 'typeorm';

export class PopulationSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const populationRepository = this.dataSource.getRepository('m_population');

    const populationData = [
      {
        no_unit: 'UNIT-001',
        vin_number: 'VIN001234567890',
        date_arrive: new Date('2024-01-15'),
        status: 'active',
        unit_type_id: 1, // Excavator
        no_unit_system: 'SYS-001',
        engine_brand_id: 1, // Caterpillar
        activities_id: 1, // Excavation
        remarks: 'New unit for Jakarta site',
        site_id: 1, // Site Jakarta
        last_unit_number: 'new-unit',
        tyre_type: '6x4',
        company: 'PT MSF Jakarta',
      },
      {
        no_unit: 'UNIT-002',
        vin_number: 'VIN002345678901',
        date_arrive: new Date('2024-01-20'),
        status: 'active',
        unit_type_id: 2, // Bulldozer
        no_unit_system: 'SYS-002',
        engine_brand_id: 2, // Komatsu
        activities_id: 2, // Loading
        remarks: 'Heavy duty bulldozer',
        site_id: 1, // Site Jakarta
        last_unit_number: 'new-unit',
        tyre_type: '8x4',
        company: 'PT MSF Jakarta',
      },
      {
        no_unit: 'UNIT-003',
        vin_number: 'VIN003456789012',
        date_arrive: new Date('2024-02-01'),
        status: 'active',
        unit_type_id: 3, // Crane
        no_unit_system: 'SYS-003',
        engine_brand_id: 3, // Hitachi
        activities_id: 3, // Transportation
        remarks: 'Mobile crane for Surabaya',
        site_id: 2, // Site Surabaya
        last_unit_number: 'new-unit',
        tyre_type: '6x4',
        company: 'PT MSF Surabaya',
      },
      {
        no_unit: 'UNIT-004',
        vin_number: 'VIN004567890123',
        date_arrive: new Date('2024-02-10'),
        status: 'active',
        unit_type_id: 4, // Truck
        no_unit_system: 'SYS-004',
        engine_brand_id: 4, // Volvo
        activities_id: 4, // Unloading
        remarks: 'Dump truck for Medan',
        site_id: 3, // Site Medan
        last_unit_number: 'new-unit',
        tyre_type: '8x4',
        company: 'PT MSF Medan',
      },
      {
        no_unit: 'UNIT-005',
        vin_number: 'VIN005678901234',
        date_arrive: new Date('2024-02-15'),
        status: 'active',
        unit_type_id: 5, // Loader
        no_unit_system: 'SYS-005',
        engine_brand_id: 5, // Liebherr
        activities_id: 5, // Compaction
        remarks: 'Wheel loader for Makassar',
        site_id: 4, // Site Makassar
        last_unit_number: 'new-unit',
        tyre_type: '6x4',
        company: 'PT MSF Makassar',
      },
      {
        no_unit: 'UNIT-006',
        vin_number: 'VIN006789012345',
        date_arrive: new Date('2024-03-01'),
        status: 'active',
        unit_type_id: 6, // Generator
        no_unit_system: 'SYS-006',
        engine_brand_id: 1, // Caterpillar
        activities_id: 6, // Grading
        remarks: 'Power generator for Semarang',
        site_id: 5, // Site Semarang
        last_unit_number: 'new-unit',
        tyre_type: '6x4',
        company: 'PT MSF Semarang',
      },
      {
        no_unit: 'UNIT-007',
        vin_number: 'VIN007890123456',
        date_arrive: new Date('2024-03-10'),
        status: 'active',
        unit_type_id: 7, // Compressor
        no_unit_system: 'SYS-007',
        engine_brand_id: 2, // Komatsu
        activities_id: 7, // Drilling
        remarks: 'Air compressor for Jakarta',
        site_id: 1, // Site Jakarta
        last_unit_number: 'second-unit',
        tyre_type: '6x4',
        company: 'PT MSF Jakarta',
      },
      {
        no_unit: 'UNIT-008',
        vin_number: 'VIN008901234567',
        date_arrive: new Date('2024-03-15'),
        status: 'active',
        unit_type_id: 8, // Welding Machine
        no_unit_system: 'SYS-008',
        engine_brand_id: 3, // Hitachi
        activities_id: 8, // Welding
        remarks: 'Welding equipment for Surabaya',
        site_id: 2, // Site Surabaya
        last_unit_number: 'new-unit',
        tyre_type: '6x4',
        company: 'PT MSF Surabaya',
      },
      {
        no_unit: 'UNIT-009',
        vin_number: 'VIN009012345678',
        date_arrive: new Date('2024-04-01'),
        status: 'active',
        unit_type_id: 9, // Excavator Mini
        no_unit_system: 'SYS-009',
        engine_brand_id: 4, // Volvo
        activities_id: 9, // Maintenance
        remarks: 'Mini excavator for Medan',
        site_id: 3, // Site Medan
        last_unit_number: 'new-unit',
        tyre_type: '6x4',
        company: 'PT MSF Medan',
      },
      {
        no_unit: 'UNIT-010',
        vin_number: 'VIN010123456789',
        date_arrive: new Date('2024-04-10'),
        status: 'active',
        unit_type_id: 10, // Dump Truck
        no_unit_system: 'SYS-010',
        engine_brand_id: 5, // Liebherr
        activities_id: 10, // Inspection
        remarks: 'Dump truck for Makassar',
        site_id: 4, // Site Makassar
        last_unit_number: 'new-unit',
        tyre_type: '8x4',
        company: 'PT MSF Makassar',
      },
      {
        no_unit: 'UNIT-011',
        vin_number: 'VIN011234567890',
        date_arrive: new Date('2024-04-15'),
        status: 'active',
        unit_type_id: 1, // Excavator
        no_unit_system: 'SYS-011',
        engine_brand_id: 1, // Caterpillar
        activities_id: 1, // Excavation
        remarks: 'Additional excavator for Semarang',
        site_id: 5, // Site Semarang
        last_unit_number: 'second-unit',
        tyre_type: '6x4',
        company: 'PT MSF Semarang',
      },
      {
        no_unit: 'UNIT-012',
        vin_number: 'VIN012345678901',
        date_arrive: new Date('2024-05-01'),
        status: 'active',
        unit_type_id: 2, // Bulldozer
        no_unit_system: 'SYS-012',
        engine_brand_id: 2, // Komatsu
        activities_id: 2, // Loading
        remarks: 'Additional bulldozer for Jakarta',
        site_id: 1, // Site Jakarta
        last_unit_number: 'second-unit',
        tyre_type: '8x4',
        company: 'PT MSF Jakarta',
      },
      {
        no_unit: 'UNIT-013',
        vin_number: 'VIN013456789012',
        date_arrive: new Date('2024-05-10'),
        status: 'active',
        unit_type_id: 3, // Crane
        no_unit_system: 'SYS-013',
        engine_brand_id: 3, // Hitachi
        activities_id: 3, // Transportation
        remarks: 'Additional crane for Surabaya',
        site_id: 2, // Site Surabaya
        last_unit_number: 'second-unit',
        tyre_type: '6x4',
        company: 'PT MSF Surabaya',
      },
      {
        no_unit: 'UNIT-014',
        vin_number: 'VIN014567890123',
        date_arrive: new Date('2024-05-15'),
        status: 'active',
        unit_type_id: 4, // Truck
        no_unit_system: 'SYS-014',
        engine_brand_id: 4, // Volvo
        activities_id: 4, // Unloading
        remarks: 'Additional truck for Medan',
        site_id: 3, // Site Medan
        last_unit_number: 'second-unit',
        tyre_type: '8x4',
        company: 'PT MSF Medan',
      },
      {
        no_unit: 'UNIT-015',
        vin_number: 'VIN015678901234',
        date_arrive: new Date('2024-06-01'),
        status: 'active',
        unit_type_id: 5, // Loader
        no_unit_system: 'SYS-015',
        engine_brand_id: 5, // Liebherr
        activities_id: 5, // Compaction
        remarks: 'Additional loader for Makassar',
        site_id: 4, // Site Makassar
        last_unit_number: 'second-unit',
        tyre_type: '6x4',
        company: 'PT MSF Makassar',
      },
    ];

    for (const popData of populationData) {
      const existingPopulation = await populationRepository.findOne({
        where: { no_unit: popData.no_unit },
      });

      if (!existingPopulation) {
        const population = populationRepository.create(popData);
        await populationRepository.save(population);
        console.log(`✅ Population Unit "${popData.no_unit}" created`);
      } else {
        console.log(`⏭️  Population Unit "${popData.no_unit}" already exists`);
      }
    }
  }
}
