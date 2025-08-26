import { PartialType } from '@nestjs/swagger';
import { CreateFuelConsumptionDto } from './create-fuel-consumption.dto';

export class UpdateFuelConsumptionDto extends PartialType(CreateFuelConsumptionDto) {}
