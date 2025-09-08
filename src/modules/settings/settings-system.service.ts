import { HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SettingsSystem } from "./entities/settings-system.entity";
import { Repository } from "typeorm";
import { ApiResponse, successResponse } from "src/common";
import { SettingsResponseDto } from "./dto/settings.dto";


@Injectable()
export class SettingsSystemServive {
    constructor(
        @InjectRepository(SettingsSystem)
        private readonly settingsRepository: Repository<SettingsSystem>,
    ){}

    async findAll(): Promise<ApiResponse<SettingsResponseDto[]>> {
        try {
            const qb = this.settingsRepository.createQueryBuilder('settings');

            const result = await qb.getMany();

            const transformedResult: SettingsResponseDto[] = result.map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                type: item.type,
                value: item.value,
            }));
            return successResponse(transformedResult, 'Get System Settings Success');
        } catch (error){
            if (error instanceof HttpException) {
                    throw error;
                  }
                  throw new InternalServerErrorException('Gagal menghapus aktivitas'); 
        }
    }
}