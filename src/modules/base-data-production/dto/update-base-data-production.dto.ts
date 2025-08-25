import { PartialType } from '@nestjs/swagger';
import { CreateBaseDataProductionDto } from './create-base-data-production.dto';

export class UpdateBaseDataProductionDto extends PartialType(CreateBaseDataProductionDto) {}
