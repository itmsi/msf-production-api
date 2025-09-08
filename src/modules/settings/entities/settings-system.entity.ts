import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('m_settings_system') // Nama tabel di database
export class SettingsSystem {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({ nullable: true })
  description: string;

  @Expose()
  @Column()
  type: string;

  @Expose()
  @Column()
  value: string;
}