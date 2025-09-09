import { BadRequestException, Injectable, Query } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { MtdProductionItemDto, MtdProductionQueryDto, MtdProductionResponseDto } from "./dto/mtd-production.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Population } from "../population";
import { BaseDataPro, ParentBaseDataPro } from "../base-data-production";
import { paginateResponse } from "src/common";
import moment from "moment";
import { EffectiveWorkingHours } from "../effective-working-hours";


@Injectable()
export class MtdProductionService {
    constructor(private readonly dataSource: DataSource, 
        @InjectRepository(Population)
        private readonly populationRepository: Repository<Population>,
        @InjectRepository(BaseDataPro)
        private readonly baseDataProductionRepository: Repository<BaseDataPro>,
        @InjectRepository(EffectiveWorkingHours)
        private readonly effectiveWorkingHourRepository: Repository<EffectiveWorkingHours>
    ) {}

    async getMtdProduction(filters: MtdProductionQueryDto) {
        try {
            const page = parseInt(filters.page ?? '1', 10);
            const limit = parseInt(filters.limit ?? '10', 10);

            const qb =  this.baseDataProductionRepository
                .createQueryBuilder('bdp')
                .leftJoinAndSelect('bdp.parentBaseDataPro','ppp')
                .leftJoinAndSelect('ppp.population','pop')
                .addSelect(subQuery => {
                    return subQuery
                        .select('json_agg(lt.*)', 'loss_times')
                        .from('r_loss_time', 'lt')
                        .where('lt.id = pop.id')
                    }, 'loss_time')
                .select([
                    'bdp.id',
                    'bdp.kmAwal',
                    'bdp.kmAkhir',
                    'bdp.totalKm',
                    'bdp.hmAwal',
                    'bdp.hmAkhir',
                    'bdp.totalHm',
                    'bdp.material',
                    'bdp.activity',
                    'bdp.totalVessel',
                    'ppp.id',
                    'ppp.shift',
                    'ppp.activityDate',
                    'ppp.population',
                    'pop.id',
                    'pop.no_unit',
                    'pop.tyre_type'            
                ])
                .where('pop.site_id = 1')
                // .andWhere('ppp.activity_date BETWEEN :start AND :end', { start: startDate, end: endDate })
                // .groupBy('pop.id')

            var duration = 0
            if (filters.startDate || filters.endDate){
                const startDate = new Date(filters.startDate || '');
                const endDate = new Date(filters.endDate || '');

                duration = this.calculateDuration(startDate, endDate) || 0;
            }

            const [result, total] = await qb.getManyAndCount();

            const grouped: Record<string, MtdProductionItemDto> = {}

            result.forEach((item) => {
                const unit = item.parentBaseDataPro.population.no_unit;
                const tyreType = item.parentBaseDataPro.population.tyre_type;
                const activityDate = item.parentBaseDataPro.activityDate;
                const lostTime = item['loss_time'];

                console.log(lostTime);
                if (!unit) return;

                if (!grouped[unit]){
                    grouped[unit] = {
                        unit,
                        activityDate: '',
                        standby_time: 0,
                        breakdown_time: 0,
                        ewh_time: 0,
                        pa: 0,
                        ma: 0,
                        ua: 0,
                        eu: 0,
                        km: 0,
                        speed: 0,
                        ct: 0,
                        dt_type: tyreType,
                        mohh: '',
                        ore_hauling: 0,
                        quarry: 0,
                        ob: 0,
                        boulder: 0,
                        ore_barge: 0,
                        hm: 0,
                    };
                }

                grouped[unit].hm += Number(item.totalHm || 0);
                grouped[unit].km += Number(item.totalKm || 0);
                if (item.material === 'ore' && item.activity === 'hauling'){
                    grouped[unit].ore_hauling += Number(item.totalVessel || 0);
                }
                if (item.material === 'ore-barge' && item.activity === 'barging'){
                    grouped[unit].ore_barge += Number(item.totalVessel || 0);
                }
                if (item.material === 'quarry'){
                    grouped[unit].quarry += Number(item.totalVessel || 0);
                }
                if (item.material === 'boulder'){
                    grouped[unit].boulder += Number(item.totalVessel || 0);
                }
                if (item.material === 'ob'){
                    grouped[unit].ob += Number(item.totalVessel || 0);
                }
                grouped[unit].speed = (grouped[unit].km / grouped[unit].hm || 0);

                grouped[unit].ewh_time = grouped[unit].hm;

                grouped[unit].activityDate = moment(activityDate).format('YYYY-MM-DD');
                    
                grouped[unit].standby_time = 0

                const totalCt = grouped[unit].hm /
                    (
                        grouped[unit].ore_hauling +    
                        grouped[unit].ore_barge + 
                        grouped[unit].ob + 
                        grouped[unit].quarry + 
                        grouped[unit].boulder
                    )
                grouped[unit].ct = totalCt

                grouped[unit].mohh = `${duration * 24}`
            });

            const groupedResult = Object.values(grouped);

            console.log(groupedResult);

            return paginateResponse(
                    groupedResult,
                    total,
                    page,
                    limit,
                    'Data berhasil diambil',
                  );
        } catch (error){
            throw new BadRequestException(`Gagal mendapatkan data: ${error.message}`); 
        }
    }

    async getDayProduction(filters: MtdProductionQueryDto){
        try {
            return {
                statusCode: 200,
                message: 'success',
                data: [],
            };
        } catch (error){
            throw new BadRequestException(`Gagal mendapatkan data`); 
        }
    }

    async getMtdWorkHour(filters: MtdProductionQueryDto){
        try {
            return {
                statusCode: 200,
                message: 'success',
                data: [],
            };
        } catch (error){
            throw new BadRequestException(`Gagal mendapatkan data`); 
        }
    }

    async getDayWorkHour(filters: MtdProductionQueryDto){
         try {
            return {
                statusCode: 200,
                message: 'success',
                data: [],
            };
        } catch (error){
            throw new BadRequestException(`Gagal mendapatkan data`); 
        }
    }

    private calculateDuration(start: Date, finish: Date): number {
            const diffMs = finish.getTime() - start.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return Math.round(diffDays * 100) / 100; // Round to 2 decimal places
  }
}