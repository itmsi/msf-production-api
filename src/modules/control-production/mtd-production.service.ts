import { BadRequestException, Injectable, Query } from "@nestjs/common";
import { Repository } from "typeorm";
import { DayProductionItemDto, DayProductionQueryDto, DayProductionResponseDto, MtdProductionItemDto, MtdProductionQueryDto, MtdProductionResponseDto } from "./dto/mtd-production.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseDataPro } from "../base-data-production";
import { paginateResponse } from "src/common";
import moment from "moment";

@Injectable()
export class MtdProductionService {
    constructor(
        @InjectRepository(BaseDataPro)
        private readonly baseDataProductionRepository: Repository<BaseDataPro>,
    ) {}

    async getMtdProduction(filters: MtdProductionQueryDto) {
        try {
            const page = parseInt(filters.page ?? '1', 10);
            const limit = parseInt(filters.limit ?? '10', 10);

            const qb =  this.baseDataProductionRepository
                .createQueryBuilder('bdp')
                .leftJoinAndSelect('bdp.parentBaseDataPro','ppp')
                .leftJoinAndSelect('ppp.population','pop')
                .where('pop.site_id = 1')
                // .groupBy('pop.id')

            var duration = 0
            if (filters.startDate || filters.endDate){
                const startDate = new Date(filters.startDate || '');
                const endDate = new Date(filters.endDate || '');

                duration = this.calculateDuration(startDate, endDate) || 0;

                qb.andWhere('ppp.activityDate BETWEEN :start AND :end', { start: startDate, end: endDate });
            }

            const [result, total] = await qb.getManyAndCount();

            const grouped: Record<string, MtdProductionItemDto> = {}

            result.forEach((item) => {
                const unit = item.parentBaseDataPro.population.no_unit;
                const tyreType = item.parentBaseDataPro.population.tyre_type;
                const activityDate = item.parentBaseDataPro.activityDate;
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
                        hm: 0,
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
                        ore_hauling_tonnage: 0,
                        quarry_tonnage: 0,
                        ore_barge_tonnage: 0,
                        boulder_tonnage: 0,
                        ob_tonnage: 0,
                        sr: 0
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

                if (item.parentBaseDataPro.population.tyre_type == '6x4'){
                    grouped[unit].ore_hauling_tonnage =  Number(grouped[unit].ore_hauling * 26.56)
                } else {
                    grouped[unit].ore_hauling_tonnage =  Number(grouped[unit].ore_hauling * 29.56)
                }
                
                if (item.parentBaseDataPro.population.tyre_type == '6x4'){
                    grouped[unit].quarry_tonnage =  Number(grouped[unit].quarry * 16.6)
                } else {
                    grouped[unit].quarry_tonnage =  Number(grouped[unit].quarry * 18.26)
                }

                if (item.parentBaseDataPro.population.tyre_type == '6x4'){
                    grouped[unit].ore_barge_tonnage =  Number(grouped[unit].ore_barge * 26.56)
                } else {
                    grouped[unit].ore_barge_tonnage =  Number(grouped[unit].ore_barge * 29.56)
                }

                if (item.parentBaseDataPro.population.tyre_type == '6x4'){
                    grouped[unit].ob_tonnage =  Number((grouped[unit].ob * 26.56) / 1.6)
                } else {
                    grouped[unit].ob_tonnage =  Number((grouped[unit].ob * 29.56) / 1.6)
                }

                if (item.parentBaseDataPro.population.tyre_type == '6x4'){
                    grouped[unit].boulder_tonnage =  Number(grouped[unit].boulder * 26.56)
                } else {
                    grouped[unit].boulder_tonnage =  Number(grouped[unit].boulder * 29.56)
                }

                if (grouped[unit].ob_tonnage !== 0 && grouped[unit].ore_hauling_tonnage !== 0){
                    grouped[unit].sr = grouped[unit].ob / grouped[unit].ore_hauling
                } else {
                    grouped[unit].sr = 0
                }

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

    async getDayProduction(filters: DayProductionQueryDto){
        try {
            const page = parseInt(filters.page ?? '1', 10);
            const limit = parseInt(filters.limit ?? '10', 10);

            let selectedDate: Date | undefined;
            if (filters.selectedDate){
                selectedDate = moment(filters.selectedDate, 'YYYY-MM-DD').toDate();
            }

            const qb =  this.baseDataProductionRepository
                .createQueryBuilder('bdp')
                .leftJoinAndSelect('bdp.parentBaseDataPro','ppp')
                .leftJoinAndSelect('ppp.population','pop')
                .where('pop.site_id = :site_id', { site_id: 1 })

            
            if (selectedDate){
                qb.andWhere('ppp.activityDate == :selectedDate', { selectedDate: selectedDate });
            }

            const [result, total] = await qb.getManyAndCount();

            console.log(result);

            const transformedResult: DayProductionItemDto[] = [];

            result.forEach((item) => {
                const mohh = 24;
                const activityDate = moment(item.parentBaseDataPro.activityDate).format('YYYY-MM-DD');
                const tyreType = item.parentBaseDataPro.population.tyre_type;
                const pa = 0;
                const ma = 0;
                const ua = 0;
                const eu = 0;
                const shift = item.parentBaseDataPro.shift;
                const sr = 0;

                const totalVessel = Number(item.totalVessel) || 0;
                transformedResult.push({
                    id: item.parentBaseDataPro.id,
                    no_unit: item.parentBaseDataPro.population.no_unit,
                    activity_date: activityDate,
                    standby_time: 0,
                    breakdown_time: 0,
                    shift: shift.toUpperCase(),
                    tyre_type: tyreType,
                    ewh_time: mohh,
                    pa: pa,
                    ma: ma,
                    ua: ua,
                    eu: eu,
                    mohh: mohh,
                    
                    ore_hauling: item.material === 'ore' && item.activity === 'hauling' ? totalVessel : 0,
                    ore_barge: item.material === 'ore-barge' && item.activity === 'barging' ? totalVessel : 0,
                    quarry: item.material === 'quarry' ? totalVessel : 0,
                    ob: item.material === 'ob' ? totalVessel : 0,
                    boulder: item.material === 'boulder' ? totalVessel : 0,

                    ore_hauling_tonnage: 
                        item.material === 'ore' && 
                        item.activity === 'hauling' ?
                        item.parentBaseDataPro.population.tyre_type === '6x4' ?
                        totalVessel * 26.56 : totalVessel * 29.56 : 0,
                    ore_barge_tonnage: 
                        item.material === 'ore-barge' &&
                        item.activity === 'barging' ? 
                        item.parentBaseDataPro.population.tyre_type === '6x4' ?
                        totalVessel * 26.56 : totalVessel * 29.56 : 0,
                    quarry_tonnage: 
                        item.material === 'quarry' ?
                        item.parentBaseDataPro.population.tyre_type === '6x4' ?
                        totalVessel * 16.6 : totalVessel * 18.26 : 0,
                    ob_tonnage: 
                        item.material === 'ob' ?
                        item.parentBaseDataPro.population.tyre_type === '6x4' ?
                        totalVessel * 26.56 : totalVessel * 29.56 : 0,
                    boulder_tonnage: 
                        item.material === 'boulder' ?
                        item.parentBaseDataPro.population.tyre_type === '6x4' ? 
                        totalVessel * 29.56 : 
                        totalVessel * 26.56 : 0,
                    
                    sr: sr
                })
             });

            return paginateResponse(
                    transformedResult,
                    total,
                    page,
                    limit,
                    'Data berhasil diambil',
                  );
        } catch (error){
            throw new BadRequestException(`Gagal mendapatkan data: ${error.message}`); 
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