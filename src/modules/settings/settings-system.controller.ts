import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SettingsSystemServive } from "./settings-system.service";
import { JwtAuthGuard } from "src/common";


@ApiTags('Settings')
@Controller('settings')
export class SettingsSystemController {
    constructor(private readonly settingsSystemService: SettingsSystemServive){}
    
    @Get()
    async getAll(){
        return this.settingsSystemService.findAll();
    }
}