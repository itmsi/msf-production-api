# Swagger Documentation untuk Daily Plan Production Module

## Cara Menambahkan Dokumentasi Swagger

Untuk menambahkan dokumentasi Swagger ke controller, ikuti langkah berikut:

### 1. Install Dependencies

Pastikan package `@nestjs/swagger` sudah terinstall:

```bash
npm install @nestjs/swagger
```

### 2. Update Controller dengan Swagger Decorators

```typescript
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Daily Plan Production')
@ApiBearerAuth()
@Controller('daily-plan-production')
@UseGuards(JwtAuthGuard)
export class DailyPlanProductionController {
  
  @Post()
  @ApiOperation({
    summary: 'Create Daily Plan Production',
    description: 'Membuat rencana produksi harian baru dengan validasi dan perhitungan otomatis',
  })
  @ApiBody({
    type: CreateDailyPlanProductionDto,
    description: 'Data untuk membuat daily plan production',
    examples: {
      example1: {
        summary: 'Contoh data lengkap',
        value: {
          plan_date: '2025-01-01',
          average_day_ewh: 1.5,
          average_shift_ewh: 0.75,
          ob_target: 1000,
          ore_target: 800,
          quarry: 200,
          ore_shipment_target: 750,
          total_fleet: 15,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Daily plan production berhasil dibuat',
    type: DailyPlanProductionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validasi gagal atau data duplikat',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid',
  })
  create(@Body() createDto: CreateDailyPlanProductionDto) {
    return this.dailyPlanProductionService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get All Daily Plan Production',
    description: 'Mengambil semua data rencana produksi dengan pagination dan filter',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Filter tanggal mulai (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Filter tanggal akhir (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Nomor halaman',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit per halaman',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Data daily plan production berhasil diambil',
  })
  findAll(@Query() queryDto: QueryDailyPlanProductionDto) {
    return this.dailyPlanProductionService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Daily Plan Production by ID',
    description: 'Mengambil data rencana produksi berdasarkan ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID rencana produksi',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Data daily plan production berhasil diambil',
    type: DailyPlanProductionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Data tidak ditemukan',
  })
  findOne(@Param('id') id: string) {
    return this.dailyPlanProductionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Daily Plan Production',
    description: 'Update data rencana produksi berdasarkan ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID rencana produksi',
    example: 1,
  })
  @ApiBody({
    type: UpdateDailyPlanProductionDto,
    description: 'Data untuk update daily plan production',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily plan production berhasil diupdate',
    type: DailyPlanProductionResponseDto,
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateDailyPlanProductionDto) {
    return this.dailyPlanProductionService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Daily Plan Production',
    description: 'Soft delete data rencana produksi berdasarkan ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID rencana produksi',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Daily plan production berhasil dihapus',
  })
  remove(@Param('id') id: string) {
    return this.dailyPlanProductionService.remove(+id);
  }
}
```

### 3. Update DTO dengan Swagger Decorators

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateDailyPlanProductionDto {
  @ApiProperty({
    description: 'Tanggal rencana (format: YYYY-MM-DD)',
    example: '2025-01-01',
    type: String,
  })
  @IsDateString()
  plan_date: string;

  @ApiProperty({
    description: 'Rata-rata EWH per hari',
    example: 1.5,
    type: Number,
  })
  @IsNumber()
  average_day_ewh: number;

  @ApiProperty({
    description: 'Rata-rata EWH per shift',
    example: 0.75,
    type: Number,
  })
  @IsNumber()
  average_shift_ewh: number;

  @ApiProperty({
    description: 'Target OB (Overburden)',
    example: 1000,
    type: Number,
  })
  @IsNumber()
  ob_target: number;

  @ApiProperty({
    description: 'Target ore',
    example: 800,
    type: Number,
  })
  @IsNumber()
  ore_target: number;

  @ApiProperty({
    description: 'Target quarry',
    example: 200,
    type: Number,
  })
  @IsNumber()
  quarry: number;

  @ApiProperty({
    description: 'Target pengiriman ore',
    example: 750,
    type: Number,
  })
  @IsNumber()
  ore_shipment_target: number;

  @ApiProperty({
    description: 'Total armada',
    example: 15,
    type: Number,
  })
  @IsNumber()
  total_fleet: number;
}
```

### 4. Update Entity dengan Swagger Decorators

```typescript
import { ApiProperty } from '@nestjs/swagger';

@Entity('r_plan_production')
export class DailyPlanProduction {
  @ApiProperty({
    description: 'ID unik',
    example: 1,
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Tanggal rencana',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
  })
  @Column({ type: 'date', nullable: true })
  plan_date: Date;

  @ApiProperty({
    description: 'Apakah hari kalender',
    example: true,
    type: Boolean,
  })
  @Column({ type: 'boolean', default: true, nullable: true })
  is_calender_day: boolean;

  @ApiProperty({
    description: 'Apakah hari libur',
    example: false,
    type: Boolean,
  })
  @Column({ type: 'boolean', default: false, nullable: true })
  is_holiday_day: boolean;

  @ApiProperty({
    description: 'Apakah hari tersedia',
    example: true,
    type: Boolean,
  })
  @Column({ type: 'boolean', default: true, nullable: true })
  is_available_day: boolean;

  @ApiProperty({
    description: 'Rata-rata EWH per hari',
    example: 1.5,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  average_day_ewh: number;

  @ApiProperty({
    description: 'Rata-rata EWH per shift',
    example: 0.75,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  average_shift_ewh: number;

  @ApiProperty({
    description: 'Target OB (Overburden)',
    example: 1000,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  ob_target: number;

  @ApiProperty({
    description: 'Target ore',
    example: 800,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  ore_target: number;

  @ApiProperty({
    description: 'Target quarry',
    example: 200,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  quarry: number;

  @ApiProperty({
    description: 'Target SR (dihitung otomatis: ob_target / ore_target)',
    example: 1.25,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  sr_target: number;

  @ApiProperty({
    description: 'Target pengiriman ore',
    example: 750,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  ore_shipment_target: number;

  @ApiProperty({
    description: 'Stock lama harian (dihitung otomatis)',
    example: 0,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  daily_old_stock: number;

  @ApiProperty({
    description: 'Target OB per shift (dihitung otomatis: ob_target / 2)',
    example: 500,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  shift_ob_target: number;

  @ApiProperty({
    description: 'Target ore per shift (dihitung otomatis: ore_target / 2)',
    example: 400,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  shift_ore_target: number;

  @ApiProperty({
    description: 'Target quarry per shift (dihitung otomatis: quarry / 2)',
    example: 100,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  shift_quarrt: number;

  @ApiProperty({
    description: 'Target SR per shift (dihitung otomatis: shift_ob_target / shift_ore_target)',
    example: 1.25,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  shift_sr_target: number;

  @ApiProperty({
    description: 'Total armada',
    example: 15,
    type: Number,
  })
  @Column({ type: 'int', nullable: true })
  total_fleet: number;

  @ApiProperty({
    description: 'Stock tersisa (dihitung otomatis: old_stock_global - ore_shipment_target + ore_target)',
    example: 50,
    type: Number,
  })
  @Column({ type: 'float', nullable: true })
  remaining_stock: number;

  @ApiProperty({
    description: 'Waktu pembuatan',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Waktu update terakhir',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Waktu penghapusan (soft delete)',
    example: null,
    type: Date,
    nullable: true,
  })
  @DeleteDateColumn()
  deletedAt: Date;
}
```

### 5. Update main.ts untuk Swagger

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('MSF Production API')
    .setDescription('API untuk manajemen produksi MSF')
    .setVersion('1.0')
    .addTag('Daily Plan Production', 'Manajemen rencana produksi harian')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
```

### 6. Fitur Swagger yang Tersedia

1. **API Tags**: Mengelompokkan endpoint berdasarkan kategori
2. **Operation Descriptions**: Penjelasan detail untuk setiap endpoint
3. **Request Body Examples**: Contoh data untuk testing
4. **Response Schemas**: Struktur response yang diharapkan
5. **Parameter Validation**: Validasi input parameter
6. **Authentication**: JWT Bearer token
7. **Error Responses**: Dokumentasi error yang mungkin terjadi

### 7. Akses Swagger UI

Setelah setup selesai, akses Swagger UI di:

```
http://localhost:3000/api
```

### 8. Testing dengan Swagger

1. Buka Swagger UI
2. Authorize dengan JWT token
3. Test endpoint secara langsung
4. Lihat response dan error handling
5. Download OpenAPI specification

### 9. Keuntungan Dokumentasi Swagger

- **Developer Experience**: Mudah untuk testing dan debugging
- **API Documentation**: Dokumentasi yang interaktif dan selalu update
- **Client Generation**: Generate client code otomatis
- **Testing**: Test API langsung dari UI
- **Collaboration**: Tim development dan QA dapat menggunakan dokumentasi yang sama
