import { DataSource } from 'typeorm';
import { Roles } from '../../modules/roles/entities/roles.entity';

export class RolesSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const rolesRepository = this.dataSource.getRepository(Roles);
    const sitesRepository = this.dataSource.getRepository('m_sites');

    // Get first site for roles
    const sites = await sitesRepository.find();
    if (sites.length === 0) {
      console.log('❌ No sites found. Please run sites seeder first.');
      return;
    }
    const defaultSiteId = sites[0].id;

    const rolesData = [
      {
        role_code: 'SUPER_ADMIN',
        position_name: 'Super Administrator',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        role_code: 'ADMIN',
        position_name: 'Administrator',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        role_code: 'MANAGER',
        position_name: 'Manager',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        role_code: 'SUPERVISOR',
        position_name: 'Supervisor',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        role_code: 'OPERATOR',
        position_name: 'Operator',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        role_code: 'STAFF',
        position_name: 'Staff',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        role_code: 'VIEWER',
        position_name: 'Viewer',
        role_parent: '',
        sites_id: defaultSiteId,
      },
    ];

    for (const roleData of rolesData) {
      const existingRole = await rolesRepository.findOne({
        where: { role_code: roleData.role_code },
      });

      if (!existingRole) {
        const role = rolesRepository.create(roleData);
        await rolesRepository.save(role);
        console.log(`✅ Role "${roleData.position_name}" created`);
      } else {
        console.log(`⏭️  Role "${roleData.position_name}" already exists`);
      }
    }
  }
}
