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
        roleCode: 'SUPER_ADMIN',
        name: 'Super Administrator',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        roleCode: 'ADMIN',
        name: 'Administrator',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        roleCode: 'MANAGER',
        name: 'Manager',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        roleCode: 'SUPERVISOR',
        name: 'Supervisor',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        roleCode: 'OPERATOR',
        name: 'Operator',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        roleCode: 'STAFF',
        name: 'Staff',
        role_parent: '',
        sites_id: defaultSiteId,
      },
      {
        roleCode: 'VIEWER',
        name: 'Viewer',
        role_parent: '',
        sites_id: defaultSiteId,
      },
    ];

    for (const roleData of rolesData) {
      const existingRole = await rolesRepository.findOne({
        where: { roleCode: roleData.roleCode },
      });

      if (!existingRole) {
        const role = rolesRepository.create(roleData);
        await rolesRepository.save(role);
        console.log(`✅ Role "${roleData.name}" created`);
      } else {
        console.log(`⏭️  Role "${roleData.name}" already exists`);
      }
    }
  }
}
