import { DataSource } from 'typeorm';

export class PopulationSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const populationRepository = this.dataSource.getRepository('m_population');
    
    // Get existing IDs from related tables
    const unitTypeRepository = this.dataSource.getRepository('m_unit_type');
    const activitiesRepository = this.dataSource.getRepository('m_activities');
    const sitesRepository = this.dataSource.getRepository('m_sites');

    // Get existing unit types
    const unitTypes = await unitTypeRepository.find();
    const activities = await activitiesRepository.find();
    const sites = await sitesRepository.find();

    if (unitTypes.length === 0 || activities.length === 0 || sites.length === 0) {
      console.log('⚠️  Related data not found. Please run other seeders first.');
      return;
    }

    const populationData = [
      {
        date_arrive: new Date('2024-01-15'),
        status: 'active',
        unit_type_id: unitTypes[0]?.id || 1, // Excavator
        no_unit: 'KFM-DT-001',
        vin_number: 'LZGJLDR45RX026969',
        no_unit_system: 'SYS-001',
        engine_brand: 'cummins',
        serial_engine: 'CAT-001',
        activities_id: activities[0]?.id || 1, // Excavation
        site_origin: 'Jakarta',
        remarks: 'RFU',
        site_id: sites[0]?.id || 1, // Site Jakarta
        company: 'KFM',
        tyre_type: '6x4',
      },
      {
        date_arrive: new Date('2024-01-20'),
        status: 'active',
        unit_type_id: unitTypes[1]?.id || 2, // Bulldozer
        no_unit: 'KFM-DT-002',
        vin_number: 'VIN002345678901',
        no_unit_system: 'SYS-002',
        engine_brand: 'weichai',
        serial_engine: 'KOM-001',
        activities_id: activities[1]?.id || 2, // Loading
        site_origin: 'Jakarta',
        remarks: 'BD',
        site_id: sites[0]?.id || 1, // Site Jakarta
        company: 'KFM',
        tyre_type: '8x4',
      },
      {
        date_arrive: new Date('2024-02-01'),
        status: 'active',
        unit_type_id: unitTypes[2]?.id || 3, // Crane
        no_unit: 'KFM-FT-001',
        vin_number: 'VIN003456789012',
        no_unit_system: 'SYS-003',
        engine_brand: 'cummins',
        serial_engine: 'HIT-001',
        activities_id: activities[2]?.id || 3, // Transportation
        site_origin: 'Surabaya',
        remarks: 'RFU',
        site_id: sites[1]?.id || 2, // Site Surabaya
        company: 'KFM',
        tyre_type: '6x4',
      },
      {
        date_arrive: new Date('2024-02-10'),
        status: 'active',
        unit_type_id: unitTypes[3]?.id || 4, // Truck
        no_unit: 'KFM-DT-003',
        vin_number: 'VIN004567890123',
        no_unit_system: 'SYS-004',
        engine_brand: 'weichai',
        serial_engine: 'VOL-001',
        activities_id: activities[3]?.id || 4, // Unloading
        site_origin: 'Medan',
        remarks: 'BD',
        site_id: sites[2]?.id || 3, // Site Medan
        company: 'KFM',
        tyre_type: '8x4',
      },
      {
        date_arrive: new Date('2024-02-15'),
        status: 'active',
        unit_type_id: unitTypes[4]?.id || 5, // Loader
        no_unit: 'KFM-FT-002',
        vin_number: 'VIN005678901234',
        no_unit_system: 'SYS-005',
        engine_brand: 'cummins',
        serial_engine: 'LIE-001',
        activities_id: activities[4]?.id || 5, // Compaction
        site_origin: 'Makassar',
        remarks: 'RFU',
        site_id: sites[3]?.id || 4, // Site Makassar
        company: 'KFM',
        tyre_type: '6x4',
      },
      {
        date_arrive: new Date('2024-03-01'),
        status: 'active',
        unit_type_id: unitTypes[5]?.id || 6, // Generator
        no_unit: 'KFM-DT-004',
        vin_number: 'VIN006789012345',
        no_unit_system: 'SYS-006',
        engine_brand: 'cummins',
        serial_engine: 'CAT-002',
        activities_id: activities[5]?.id || 6, // Grading
        site_origin: 'Semarang',
        remarks: 'RFU',
        site_id: sites[4]?.id || 5, // Site Semarang
        company: 'KFM',
        tyre_type: '6x4',
      },
      {
        date_arrive: new Date('2024-03-10'),
        status: 'active',
        unit_type_id: unitTypes[6]?.id || 7, // Compressor
        no_unit: 'KFM-FT-003',
        vin_number: 'VIN007890123456',
        no_unit_system: 'SYS-007',
        engine_brand: 'weichai',
        serial_engine: 'KOM-002',
        activities_id: activities[6]?.id || 7, // Drilling
        site_origin: 'Jakarta',
        remarks: 'BD',
        site_id: sites[0]?.id || 1, // Site Jakarta
        company: 'KFM',
        tyre_type: '6x4',
      },
      {
        date_arrive: new Date('2024-03-15'),
        status: 'active',
        unit_type_id: unitTypes[7]?.id || 8, // Welding Machine
        no_unit: 'KFM-DT-005',
        vin_number: 'VIN008901234567',
        no_unit_system: 'SYS-008',
        engine_brand: 'cummins',
        serial_engine: 'HIT-002',
        activities_id: activities[7]?.id || 8, // Welding
        site_origin: 'Surabaya',
        remarks: 'RFU',
        site_id: sites[1]?.id || 2, // Site Surabaya
        company: 'KFM',
        tyre_type: '6x4',
      },
      {
        date_arrive: new Date('2024-04-01'),
        status: 'active',
        unit_type_id: unitTypes[8]?.id || 9, // Excavator Mini
        no_unit: 'KFM-FT-004',
        vin_number: 'VIN009012345678',
        no_unit_system: 'SYS-009',
        engine_brand: 'weichai',
        serial_engine: 'VOL-002',
        activities_id: activities[8]?.id || 9, // Maintenance
        site_origin: 'Medan',
        remarks: 'BD',
        site_id: sites[2]?.id || 3, // Site Medan
        company: 'KFM',
        tyre_type: '6x4',
      },
      {
        date_arrive: new Date('2024-04-10'),
        status: 'active',
        unit_type_id: unitTypes[9]?.id || 10, // Dump Truck
        no_unit: 'KFM-DT-006',
        vin_number: 'VIN010123456789',
        no_unit_system: 'SYS-010',
        engine_brand: 'cummins',
        serial_engine: 'LIE-002',
        activities_id: activities[9]?.id || 10, // Inspection
        site_origin: 'Makassar',
        remarks: 'RFU',
        site_id: sites[3]?.id || 4, // Site Makassar
        company: 'KFM',
        tyre_type: '8x4',
      },
      {
        date_arrive: new Date('2024-04-15'),
        status: 'active',
        unit_type_id: unitTypes[0]?.id || 1, // Excavator
        no_unit: 'KFM-FT-005',
        vin_number: 'VIN011234567890',
        no_unit_system: 'SYS-011',
        engine_brand: 'cummins',
        serial_engine: 'CAT-003',
        activities_id: activities[0]?.id || 1, // Excavation
        site_origin: 'Semarang',
        remarks: 'RFU',
        site_id: sites[4]?.id || 5, // Site Semarang
        company: 'KFM',
        tyre_type: '6x4',
      },
      {
        date_arrive: new Date('2024-05-01'),
        status: 'active',
        unit_type_id: unitTypes[1]?.id || 2, // Bulldozer
        no_unit: 'KFM-DT-007',
        vin_number: 'VIN012345678901',
        no_unit_system: 'SYS-012',
        engine_brand: 'weichai',
        serial_engine: 'KOM-003',
        activities_id: activities[1]?.id || 2, // Loading
        site_origin: 'Jakarta',
        remarks: 'BD',
        site_id: sites[0]?.id || 1, // Site Jakarta
        company: 'KFM',
        tyre_type: '8x4',
      },
      {
        date_arrive: new Date('2024-05-10'),
        status: 'active',
        unit_type_id: unitTypes[2]?.id || 3, // Crane
        no_unit: 'KFM-FT-006',
        vin_number: 'VIN013456789012',
        no_unit_system: 'SYS-013',
        engine_brand: 'cummins',
        serial_engine: 'HIT-003',
        activities_id: activities[2]?.id || 3, // Transportation
        site_origin: 'Surabaya',
        remarks: 'RFU',
        site_id: sites[1]?.id || 2, // Site Surabaya
        company: 'KFM',
        tyre_type: '6x4',
      },
      {
        date_arrive: new Date('2024-05-15'),
        status: 'active',
        unit_type_id: unitTypes[3]?.id || 4, // Truck
        no_unit: 'KFM-DT-008',
        vin_number: 'VIN014567890123',
        no_unit_system: 'SYS-014',
        engine_brand: 'weichai',
        serial_engine: 'VOL-003',
        activities_id: activities[3]?.id || 4, // Unloading
        site_origin: 'Medan',
        remarks: 'BD',
        site_id: sites[2]?.id || 3, // Site Medan
        company: 'KFM',
        tyre_type: '8x4',
      },
      {
        date_arrive: new Date('2024-06-01'),
        status: 'active',
        unit_type_id: unitTypes[4]?.id || 5, // Loader
        no_unit: 'KFM-FT-007',
        vin_number: 'VIN015678901234',
        no_unit_system: 'SYS-015',
        engine_brand: 'cummins',
        serial_engine: 'LIE-003',
        activities_id: activities[4]?.id || 5, // Compaction
        site_origin: 'Makassar',
        remarks: 'RFU',
        site_id: sites[3]?.id || 4, // Site Makassar
        company: 'KFM',
        tyre_type: '6x4',
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
