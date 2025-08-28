import { PartialType } from '@nestjs/swagger';
import { CreateHaulingListDto } from './create-hauling-list.dto';

export class UpdateHaulingListDto extends PartialType(CreateHaulingListDto) {}
