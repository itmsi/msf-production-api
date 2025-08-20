import { DataSource } from 'typeorm';
import { Barge } from '../../modules/barge/entities/barge.entity';

export class BargeSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const bargeRepository = this.dataSource.getRepository(Barge);

    // Check if data already exists
    const existingBarges = await bargeRepository.find();
    if (existingBarges.length > 0) {
      console.log('Barge data already exists, skipping seeder...');
      return;
    }

    const bargeData = [
      {
        name: 'Barge Kalimantan',
        capacity: 1000,
        remarks: 'Barge untuk pengangkutan batu bara dari Kalimantan',
        createdBy: 1,
        updatedBy: 1,
      },
      {
        name: 'Barge Sumatra',
        capacity: 1500,
        remarks: 'Barge untuk pengangkutan CPO dari Sumatra',
        createdBy: 1,
        updatedBy: 1,
      },
      {
        name: 'Barge Sulawesi',
        capacity: 800,
        remarks: 'Barge untuk pengangkutan nikel dari Sulawesi',
        createdBy: 1,
        updatedBy: 1,
      },
      {
        name: 'Barge Papua',
        capacity: 1200,
        remarks: 'Barge untuk pengangkutan tembaga dari Papua',
        createdBy: 1,
        updatedBy: 1,
      },
      {
        name: 'Barge Jawa',
        capacity: 600,
        remarks: 'Barge untuk pengangkutan semen dari Jawa',
        createdBy: 1,
        updatedBy: 1,
      },
    ];

    for (const bargeDataItem of bargeData) {
      const barge = bargeRepository.create(bargeDataItem);
      await bargeRepository.save(barge);
    }

    console.log('Barge seeder completed successfully!');
  }
}
