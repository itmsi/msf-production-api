import { DataSource } from 'typeorm';
import { Sites } from '../../master/sites/entities/sites.entity';

export class SitesSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const sitesRepository = this.dataSource.getRepository(Sites);

    const sitesData = [
      {
        name: 'Site Jakarta',
        location: 'Jakarta, Indonesia',
        longitude: 106.8456,
        latitude: -6.2088,
      },
      {
        name: 'Site Surabaya',
        location: 'Surabaya, Indonesia',
        longitude: 112.7508,
        latitude: -7.2575,
      },
      {
        name: 'Site Medan',
        location: 'Medan, Indonesia',
        longitude: 98.6722,
        latitude: 3.5952,
      },
      {
        name: 'Site Makassar',
        location: 'Makassar, Indonesia',
        longitude: 119.4361,
        latitude: -5.1477,
      },
      {
        name: 'Site Semarang',
        location: 'Semarang, Indonesia',
        longitude: 110.4203,
        latitude: -6.9932,
      },
    ];

    for (const siteData of sitesData) {
      const existingSite = await sitesRepository.findOne({
        where: { name: siteData.name },
      });

      if (!existingSite) {
        const site = sitesRepository.create(siteData);
        await sitesRepository.save(site);
        console.log(`✅ Site "${siteData.name}" created`);
      } else {
        console.log(`⏭️  Site "${siteData.name}" already exists`);
      }
    }
  }
}
