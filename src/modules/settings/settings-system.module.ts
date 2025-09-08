import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettingsSystem } from "./entities/settings-system.entity";
import { SettingsSystemController } from "./settings-system.controller";
import { SettingsSystemServive } from "./settings-system.service";

@Module({
    imports: [TypeOrmModule.forFeature([
        SettingsSystem
    ])],
    providers: [SettingsSystemServive],
    controllers: [SettingsSystemController],
    exports: [SettingsSystemServive]
})
export class SettingsSystemModule {}