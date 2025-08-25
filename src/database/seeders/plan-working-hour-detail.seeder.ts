import { DataSource } from 'typeorm';
import { PlanWorkingHourDetail } from '../../modules/plan-working-hour/entities/plan-working-hour-detail.entity';

export default class PlanWorkingHourDetailSeeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(PlanWorkingHourDetail);

    // Data sample untuk plan working hour detail
    // Menggunakan ID yang sesuai dengan data yang ada di database
    // activities_id dimulai dari 6, bukan 1
    const planWorkingHourDetails = [
      {
        plant_working_hour_id: 2, // 2024-01-15
        activities_id: 6, // Unschedule Repair
        activities_hour: 6.0,
      },
      {
        plant_working_hour_id: 2, // 2024-01-15
        activities_id: 8, // Schedule Repair
        activities_hour: 2.0,
      },
      {
        plant_working_hour_id: 3, // 2024-01-16
        activities_id: 6, // Unschedule Repair
        activities_hour: 6.0,
      },
      {
        plant_working_hour_id: 3, // 2024-01-16
        activities_id: 8, // Schedule Repair
        activities_hour: 2.0,
      },
      {
        plant_working_hour_id: 4, // 2024-01-17
        activities_id: 6, // Unschedule Repair
        activities_hour: 6.0,
      },
      {
        plant_working_hour_id: 4, // 2024-01-17
        activities_id: 8, // Schedule Repair
        activities_hour: 2.0,
      },
      {
        plant_working_hour_id: 5, // 2024-01-18
        activities_id: 6, // Unschedule Repair
        activities_hour: 6.0,
      },
      {
        plant_working_hour_id: 5, // 2024-01-18
        activities_id: 8, // Schedule Repair
        activities_hour: 2.0,
      },
    ];

    // Insert data
    for (const detail of planWorkingHourDetails) {
      const existing = await repository.findOne({
        where: {
          plant_working_hour_id: detail.plant_working_hour_id,
          activities_id: detail.activities_id,
        },
      });

      if (!existing) {
        await repository.save(detail);
      }
    }
  }
}
