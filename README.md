<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# MSF Part

## Database Changes

### Menambahkan kolom quantity_temp_outbound ke tabel relocation

Jalankan query berikut di database untuk menambahkan kolom `quantity_temp_outbound`:

```sql
ALTER TABLE relocation ADD COLUMN quantity_temp_outbound INTEGER DEFAULT 0;
```

### Memperbaiki struktur tabel SPPB

Jika tabel SPPB belum memiliki kolom yang diperlukan, jalankan query berikut:

```sql
-- Hapus kolom uuid jika ada
ALTER TABLE sppb DROP COLUMN IF EXISTS uuid;

-- Pastikan kolom yang diperlukan ada
ALTER TABLE sppb ADD COLUMN IF NOT EXISTS order_form_id INTEGER DEFAULT 0;
ALTER TABLE sppb ADD COLUMN IF NOT EXISTS sppb_number VARCHAR(20) UNIQUE;
ALTER TABLE sppb ADD COLUMN IF NOT EXISTS mechanic_photo TEXT;
ALTER TABLE sppb ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'waiting';
ALTER TABLE sppb ADD COLUMN IF NOT EXISTS "createdBy" INTEGER DEFAULT 0;
ALTER TABLE sppb ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT now();
ALTER TABLE sppb ADD COLUMN IF NOT EXISTS "updatedBy" INTEGER DEFAULT 0;
ALTER TABLE sppb ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ;
ALTER TABLE sppb ADD COLUMN IF NOT EXISTS "deletedBy" INTEGER DEFAULT 0;
ALTER TABLE sppb ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ;
```

## API Changes

### Endpoint relocation telah diubah

Endpoint `POST /api/pda-outbound/relocation` sekarang menggunakan body request yang berbeda:

**Body Request Baru:**
```json
{
  "barcode_inbound": "abc123def456",
  "batch_outbound_id": 1
}
```

**Perubahan:**
- Quantity tidak lagi diambil dari body request
- Quantity sekarang diambil otomatis dari tabel `batch_outbound` berdasarkan `batch_outbound_id`
- Menambahkan validasi untuk memastikan `batch_outbound_id` ada di database

**Proses yang dijalankan:**
1. Validasi `barcode_inbound` ada di tabel `batch_inbound`
2. Validasi `batch_outbound_id` ada di tabel `batch_outbound`
3. Ambil `quantity` dari `batch_outbound`
4. Buat data relocation dengan quantity dari `batch_outbound`

### Endpoint scan-destination telah diubah

Endpoint `POST /api/pda-outbound/scan-destination` sekarang menggunakan body request yang berbeda:

**Body Request Baru:**
```json
{
  "batch_in_barcode": "abc123def456",
  "inbound_outbound_area_id": 1,
  "quantity": 1,
  "batch_outbound_id": 18
}
```

**Proses yang dijalankan:**
1. Mencari batch_inbound berdasarkan `batch_in_barcode`
2. Mencari relocation dengan `batch_in_id` yang sesuai dan `reloc_type = 'outbound'`
3. Validasi `inbound_outbound_area_id` ada di tabel `inbound_outbound_area`
4. Validasi `batch_outbound_id` ada di tabel `batch_outbound`
5. Update `quantity_temp_outbound` di tabel relocation dengan menambahkan quantity baru
6. Jika `quantity_temp_outbound >= quantity`, maka:
   - Update `reloc_status` menjadi `true`
   - Cari `order_form_id` dari tabel `batch_outbound` berdasarkan `batch_outbound_id`
   - Cek semua relocation yang memiliki `order_form_id` yang sama
   - Jika semua relocation sudah memiliki `reloc_status = true`, maka:
     - Buat data baru di tabel `sppb` dengan:
       - `order_form_id` dari `batch_outbound`
       - `sppb_number` auto generate (format: WHO001, WHO002, dst)
       - `mechanic_photo` = null
       - `status` = 'waiting'

**Response:**
```json
{
  "id": 1,
  "batch_in_id": 1,
  "inbound_outbound_area_id": 1,
  "quantity": 1,
  "quantity_temp_outbound": 3,
  "target_quantity": 3,
  "is_completed": true,
  "sppb_id": 1,
  "sppb_number": "WHO001"
}
```
