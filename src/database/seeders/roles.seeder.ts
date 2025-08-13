import { DataSource } from 'typeorm';
import { Roles } from '../../modules/roles/entities/roles.entity';

export class RolesSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const rolesRepository = this.dataSource.getRepository(Roles);

    const rolesData = [
      {
        roleCode: 'SUPER_ADMIN',
        name: 'Super Administrator',
        role_parent: '',
      },
      {
        roleCode: 'ADMIN',
        name: 'Administrator',
        role_parent: '',
      },
      {
        roleCode: 'MANAGER',
        name: 'Manager',
        role_parent: '',
      },
      {
        roleCode: 'SUPERVISOR',
        name: 'Supervisor',
        role_parent: '',
      },
      {
        roleCode: 'OPERATOR',
        name: 'Operator',
        role_parent: '',
      },
      {
        roleCode: 'STAFF',
        name: 'Staff',
        role_parent: '',
      },
      {
        roleCode: 'VIEWER',
        name: 'Viewer',
        role_parent: '',
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
