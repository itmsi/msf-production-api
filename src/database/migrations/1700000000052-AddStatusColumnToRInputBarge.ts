import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
} from 'typeorm';

export class AddStatusColumnToRInputBarge1700000000052 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'r_input_barge',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '50',
        isNullable: true,
        default: "'active'",
        comment: 'Status of the barge input record (active, inactive, completed, cancelled)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('r_input_barge', 'status');
  }
}
