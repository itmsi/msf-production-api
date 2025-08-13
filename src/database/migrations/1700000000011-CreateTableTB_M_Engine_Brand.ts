import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTableTB_M_Engine_Brand1700000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    // Buat tabel TB_M_Engine_Brand
    await queryRunner.createTable(
      new Table({
        name: 'm_engine_brand',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'serial_engine',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Tambahkan foreign key constraints jika diperlukan
    // Contoh: jika ada relasi dengan tabel lain
    // await queryRunner.createForeignKey(
    //   'tb_m_engine_brand',
    //   new TableForeignKey({
    //     columnNames: ['variant_id'],
    //     referencedColumnNames: ['id'],
    //     referencedTableName: 'm_unit_variant',
    //     onDelete: 'SET NULL',
    //     onUpdate: 'CASCADE',
    //   }),
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraints terlebih dahulu jika ada
    const table = await queryRunner.getTable('m_engine_brand');
    const foreignKeys = table?.foreignKeys;

    for (const foreignKey of foreignKeys || []) {
      await queryRunner.dropForeignKey('m_engine_brand', foreignKey);
    }

    // Hapus tabel
    await queryRunner.dropTable('m_engine_brand');
  }
}
