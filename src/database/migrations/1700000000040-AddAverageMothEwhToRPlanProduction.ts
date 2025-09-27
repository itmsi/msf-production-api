import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAverageMothEwhToRPlanProduction1700000000040 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'r_plan_production',
      new TableColumn({
        name: 'average_moth_ewh',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        comment: 'Average month EWH (Equivalent Working Hours)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('r_plan_production', 'average_moth_ewh');
  }
}
