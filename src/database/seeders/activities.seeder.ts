import { DataSource } from 'typeorm';

export class ActivitiesSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const activitiesRepository = this.dataSource.getRepository('m_activities');

    const activitiesData = [
      {
        name: 'Excavation',
        description: 'Digging and earth moving activities',
        category: 'Earth Work',
        estimated_duration: 8,
        unit: 'hours',
        isActive: true,
      },
      {
        name: 'Loading',
        description: 'Loading materials onto transport vehicles',
        category: 'Material Handling',
        estimated_duration: 4,
        unit: 'hours',
        isActive: true,
      },
      {
        name: 'Transportation',
        description: 'Moving materials between locations',
        category: 'Transport',
        estimated_duration: 6,
        unit: 'hours',
        isActive: true,
      },
      {
        name: 'Unloading',
        description: 'Unloading materials from transport vehicles',
        category: 'Material Handling',
        estimated_duration: 3,
        unit: 'hours',
        isActive: true,
      },
      {
        name: 'Compaction',
        description: 'Compacting soil or materials',
        category: 'Earth Work',
        estimated_duration: 5,
        unit: 'hours',
        isActive: true,
      },
      {
        name: 'Grading',
        description: 'Leveling and grading surfaces',
        category: 'Earth Work',
        estimated_duration: 6,
        unit: 'hours',
        isActive: true,
      },
      {
        name: 'Drilling',
        description: 'Drilling holes for foundations or utilities',
        category: 'Specialized Work',
        estimated_duration: 8,
        unit: 'hours',
        isActive: true,
      },
      {
        name: 'Welding',
        description: 'Welding operations for construction',
        category: 'Fabrication',
        estimated_duration: 4,
        unit: 'hours',
        isActive: true,
      },
      {
        name: 'Maintenance',
        description: 'Equipment maintenance and repair',
        category: 'Maintenance',
        estimated_duration: 6,
        unit: 'hours',
        isActive: true,
      },
      {
        name: 'Inspection',
        description: 'Quality control and safety inspections',
        category: 'Quality Control',
        estimated_duration: 2,
        unit: 'hours',
        isActive: true,
      },
    ];

    for (const activityData of activitiesData) {
      const existingActivity = await activitiesRepository.findOne({
        where: { name: activityData.name },
      });

      if (!existingActivity) {
        const activity = activitiesRepository.create(activityData);
        await activitiesRepository.save(activity);
        console.log(`✅ Activity "${activityData.name}" created`);
      } else {
        console.log(`⏭️  Activity "${activityData.name}" already exists`);
      }
    }
  }
}
