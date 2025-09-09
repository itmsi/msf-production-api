import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { MtdProductionService } from "./mtd-production.service";
import { MtdProductionQueryDto } from "./dto/mtd-production.dto";

@ApiTags('Control MTD Production')
@ApiBearerAuth('jwt')
@Controller('control')
export class MtdProductionController {
    constructor(
        private readonly controlMtdProductionService: MtdProductionService
    ) {}
    
    @Get('mtd-production')
    async getControlMTDProduction(@Query() query: MtdProductionQueryDto) {
        return this.controlMtdProductionService.getMtdProduction(query);
    }

    @Get('day-production')
    async getControlDayProduction(@Query() query: MtdProductionQueryDto) {
        return this.controlMtdProductionService.getDayProduction(query);
    }

    @Get('mtd-work-hour')
    async getControlMTDWorkHour(@Query() query: MtdProductionQueryDto) {
        return this.controlMtdProductionService.getMtdWorkHour(query);
    }

    @Get('day-work-hour')
    async getControlDayWorkHour(@Query() query: MtdProductionQueryDto) {
        return this.controlMtdProductionService.getDayWorkHour(query);
    }
}