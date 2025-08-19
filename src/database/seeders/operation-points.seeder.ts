import { DataSource } from 'typeorm';

export class OperationPointsSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const operationPointsRepository =
      this.dataSource.getRepository('m_operation_points');

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
        longitude: 106.85,
        latitude: -6.21,
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
        longitude: 112.745,
        latitude: -7.255,
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
        longitude: 98.675,
        latitude: 3.598,
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
        longitude: 119.432,
        latitude: -5.144,
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
        longitude: 110.425,
        latitude: -6.99,
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
