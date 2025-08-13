import { DataSource } from 'typeorm';

export class BargeSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const bargeRepository = this.dataSource.getRepository('m_barge');

    const bargesData = [
      {
        name: 'Barge-001',
        description: 'Large capacity barge for material transport',
        capacity: 1000,
        unit: 'ton',
        length: 50,
        width: 15,
        depth: 3,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Barge-002',
        description: 'Medium capacity barge for equipment transport',
        capacity: 500,
        unit: 'ton',
        length: 35,
        width: 12,
        depth: 2.5,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Barge-003',
        description: 'Small barge for personnel transport',
        capacity: 100,
        unit: 'ton',
        length: 25,
        width: 8,
        depth: 2,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Barge-004',
        description: 'Specialized barge for fuel transport',
        capacity: 300,
        unit: 'ton',
        length: 30,
        width: 10,
        depth: 2.5,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Barge-005',
        description: 'Multi-purpose barge for various cargo',
        capacity: 750,
        unit: 'ton',
        length: 40,
        width: 13,
        depth: 2.8,
        status: 'active',
        isActive: true,
      },
      {
        name: 'Barge-006',
        description: 'Emergency response barge',
        capacity: 200,
        unit: 'ton',
        length: 28,
        width: 9,
        depth: 2.2,
        status: 'active',
        isActive: true,
      },
    ];

    for (const bargeData of bargesData) {
      const existingBarge = await bargeRepository.findOne({
        where: { name: bargeData.name },
      });

      if (!existingBarge) {
        const barge = bargeRepository.create(bargeData);
        await bargeRepository.save(barge);
        console.log(`✅ Barge "${bargeData.name}" created`);
      } else {
        console.log(`⏭️  Barge "${bargeData.name}" already exists`);
      }
    }
  }
}
