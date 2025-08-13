import { DataSource } from 'typeorm';

export class OperationPointsSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const operationPointsRepository = this.dataSource.getRepository('m_operation_points');

    const operationPointsData = [
      {
        sites_id: 1, // Site Jakarta
        type: 'excavation',
        name: 'OP-001',
        longitude: 106.8456,
        latitude: -6.2088,
      },
      {
        sites_id: 1, // Site Jakarta
        type: 'loading',
        name: 'OP-002',
        longitude: 106.8500,
        latitude: -6.2100,
      },
      {
        sites_id: 2, // Site Surabaya
        type: 'transport',
        name: 'OP-003',
        longitude: 112.7508,
        latitude: -7.2575,
      },
      {
        sites_id: 2, // Site Surabaya
        type: 'unloading',
        name: 'OP-004',
        longitude: 112.7450,
        latitude: -7.2550,
      },
      {
        sites_id: 3, // Site Medan
        type: 'maintenance',
        name: 'OP-005',
        longitude: 98.6722,
        latitude: 3.5952,
      },
      {
        sites_id: 3, // Site Medan
        type: 'quality-control',
        name: 'OP-006',
        longitude: 98.6750,
        latitude: 3.5980,
      },
      {
        sites_id: 4, // Site Makassar
        type: 'safety',
        name: 'OP-007',
        longitude: 119.4366,
        latitude: -5.1477,
      },
      {
        sites_id: 4, // Site Makassar
        type: 'emergency',
        name: 'OP-008',
        longitude: 119.4320,
        latitude: -5.1440,
      },
      {
        sites_id: 5, // Site Semarang
        type: 'excavation',
        name: 'OP-009',
        longitude: 110.4203,
        latitude: -6.9936,
      },
      {
        sites_id: 5, // Site Semarang
        type: 'loading',
        name: 'OP-010',
        longitude: 110.4250,
        latitude: -6.9900,
      },
    ];

    for (const opData of operationPointsData) {
      const existingOP = await operationPointsRepository.findOne({
        where: { name: opData.name },
      });

      if (!existingOP) {
        const operationPoint = operationPointsRepository.create(opData);
        await operationPointsRepository.save(operationPoint);
        console.log(`✅ Operation Point "${opData.name}" created`);
      } else {
        console.log(`⏭️  Operation Point "${opData.name}" already exists`);
      }
    }
  }
}
