import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBaseDataProDecimalFields1756268000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ubah tipe data field yang bisa menerima decimal
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ALTER COLUMN km_awal TYPE DECIMAL(10,2)`,
    );
    
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ALTER COLUMN km_akhir TYPE DECIMAL(10,2)`,
    );
    
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ALTER COLUMN total_km TYPE DECIMAL(10,2)`,
    );
    
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ALTER COLUMN mround_distance TYPE DECIMAL(10,2)`,
    );
    
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ALTER COLUMN total_vessel TYPE DECIMAL(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Kembalikan ke tipe data sebelumnya
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ALTER COLUMN km_awal TYPE INTEGER`,
    );
    
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ALTER COLUMN km_akhir TYPE INTEGER`,
    );
    
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ALTER COLUMN total_km TYPE INTEGER`,
    );
    
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ALTER COLUMN mround_distance TYPE INTEGER`,
    );
    
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ALTER COLUMN total_vessel TYPE INTEGER`,
    );
  }
}
