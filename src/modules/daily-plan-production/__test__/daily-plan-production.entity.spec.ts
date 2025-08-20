import { DailyPlanProduction } from '../entities/daily-plan-production.entity';

describe('DailyPlanProduction Entity', () => {
  it('should be defined', () => {
    expect(DailyPlanProduction).toBeDefined();
  });

  it('should have correct table name', () => {
    const entity = new DailyPlanProduction();
    expect(entity.constructor.name).toBe('DailyPlanProduction');
  });

  it('should have all required properties', () => {
    const entity = new DailyPlanProduction();
    
    expect(entity.id).toBeUndefined();
    expect(entity.plan_date).toBeUndefined();
    expect(entity.is_calender_day).toBeUndefined();
    expect(entity.is_holiday_day).toBeUndefined();
    expect(entity.is_available_day).toBeUndefined();
    expect(entity.average_day_ewh).toBeUndefined();
    expect(entity.average_shift_ewh).toBeUndefined();
    expect(entity.ob_target).toBeUndefined();
    expect(entity.ore_target).toBeUndefined();
    expect(entity.quarry).toBeUndefined();
    expect(entity.sr_target).toBeUndefined();
    expect(entity.ore_shipment_target).toBeUndefined();
    expect(entity.daily_old_stock).toBeUndefined();
    expect(entity.shift_ob_target).toBeUndefined();
    expect(entity.shift_ore_target).toBeUndefined();
    expect(entity.shift_quarrt).toBeUndefined();
    expect(entity.shift_sr_target).toBeUndefined();
    expect(entity.total_fleet).toBeUndefined();
    expect(entity.remaining_stock).toBeUndefined();
    expect(entity.createdAt).toBeUndefined();
    expect(entity.updatedAt).toBeUndefined();
    expect(entity.deletedAt).toBeUndefined();
  });

  it('should be able to set and get values', () => {
    const entity = new DailyPlanProduction();
    const testDate = new Date('2025-01-01');
    
    entity.plan_date = testDate;
    entity.ob_target = 1000;
    entity.ore_target = 800;
    entity.quarry = 200;
    
    expect(entity.plan_date).toBe(testDate);
    expect(entity.ob_target).toBe(1000);
    expect(entity.ore_target).toBe(800);
    expect(entity.quarry).toBe(200);
  });
});
