import { DataSource } from 'typeorm';
import { PlanWorkingHour } from '../../modules/plan-working-hour/entities/plan-working-hour.entity';

export default class PlanWorkingHourSeeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(PlanWorkingHour);

    // Data sample untuk plan working hour
    const planWorkingHours = [
      {
        plan_date: new Date('2024-01-15'),
        is_calender_day: true,
        is_holiday_day: false,
        is_schedule_day: true,
        working_hour: 8.0,
        working_day_longshift: 0,
        working_hour_longshift: 0,
        mohh_per_month: 160.0,
      },
      {
        plan_date: new Date('2024-01-16'),
        is_calender_day: true,
        is_holiday_day: false,
        is_schedule_day: true,
        working_hour: 8.0,
        working_day_longshift: 0,
        working_hour_longshift: 0,
        mohh_per_month: 160.0,
      },
      {
        plan_date: new Date('2024-01-17'),
        is_calender_day: true,
        is_holiday_day: false,
        is_schedule_day: true,
        working_hour: 8.0,
        working_day_longshift: 0,
        working_hour_longshift: 0,
        mohh_per_month: 160.0,
      },
      {
        plan_date: new Date('2024-01-18'),
        is_calender_day: true,
        is_holiday_day: false,
        is_schedule_day: true,
        working_hour: 8.0,
        working_day_longshift: 0,
        working_hour_longshift: 0,
        mohh_per_month: 160.0,
      },
    ];

    // Insert data
    for (const planWorkingHour of planWorkingHours) {
      const existing = await repository.findOne({
        where: { plan_date: planWorkingHour.plan_date },
      });

      if (!existing) {
        await repository.save(planWorkingHour);
      }
    }
  }
}
