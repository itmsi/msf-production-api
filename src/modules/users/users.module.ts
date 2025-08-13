import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '.././users/entities/users.entity';
import { RabbitmqModule } from '../../integrations/rabbitmq/rabbitmq.module';
import { MailModule } from '../../integrations/mail/mail.module';
import { S3Module } from '../../integrations/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    RabbitmqModule,
    S3Module,
    MailModule,
  ], // sample import RMQ & S3
  providers: [UsersService, RabbitmqModule, MailModule],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
