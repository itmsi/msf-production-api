import { PartialType } from '@nestjs/swagger';
import { CreateBargeFormDto } from './create-barge-form.dto';

export class UpdateBargeFormDto extends PartialType(CreateBargeFormDto) {}
