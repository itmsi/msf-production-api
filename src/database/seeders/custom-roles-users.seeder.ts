import { DataSource } from 'typeorm';
import { Roles } from '../../modules/roles/entities/roles.entity';
import { Users } from '../../modules/users/entities/users.entity';
import { Sites } from '../../modules/sites/entities/sites.entity';
import { Employee } from '../../modules/employee/entities/employee.entity';
import * as bcrypt from 'bcrypt';

export class CustomRolesUsersSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🚀 Seeding custom roles, users, and access mappings...');

    const rolesRepository = this.dataSource.getRepository(Roles);
    const usersRepository = this.dataSource.getRepository(Users);
    const sitesRepository = this.dataSource.getRepository(Sites);
    const employeeRepository = this.dataSource.getRepository(Employee);

    const sites = await sitesRepository.find();
    if (sites.length === 0) {
      console.log('❌ No sites found. Please run sites seeder first.');
      return;
    }
    const defaultSiteId = sites[0].id;

    const employees = await employeeRepository.find();
    if (employees.length === 0) {
      console.log('❌ No employees found. Please run employee seeder first.');
      return;
    }

    // Ensure roles
    const ensureRole = async (role_code: string, position_name: string) => {
      const existing = await rolesRepository.findOne({ where: { role_code } });
      if (!existing) {
        const role = rolesRepository.create({
          role_code,
          position_name,
          role_parent: '',
          sites_id: defaultSiteId,
        });
        await rolesRepository.save(role);
        console.log(`✅ Role created: ${position_name} (${role_code})`);
      } else {
        console.log(`⏭️  Role exists: ${position_name} (${role_code})`);
      }
    };

    await ensureRole('PRODUCTION_ADMIN', 'Production Administrator');
    await ensureRole('MANAGEMENT', 'Management');
    await ensureRole('CCR', 'CCR');

    // Ensure users
    const employeeIdFor = (index: number) =>
      employees[index] ? employees[index].id : employees[0].id;

    const ensureUser = async (username: string, email: string) => {
      const existing = await usersRepository.findOne({ where: { username } });
      if (!existing) {
        const passwordHash = await bcrypt.hash('Qwer1234!', 10);
        const user = usersRepository.create({
          username,
          email,
          password: passwordHash,
          employee_id: employeeIdFor(
            Math.floor(Math.random() * Math.min(3, employees.length)),
          ),
          isActive: true,
        });
        await usersRepository.save(user);
        console.log(`✅ User created: ${username}`);
      } else {
        console.log(`⏭️  User exists: ${username}`);
      }
    };

    await ensureUser('productionadmin', 'productionadmin@msf.com');
    await ensureUser('management', 'management@msf.com');
    await ensureUser('ccr', 'ccr@msf.com');

    // Map role permissions based on requested access lists
    const roleAccessMap: Record<
      string,
      Array<{ menuCode: string; permissions: string[] }>
    > = {
      PRODUCTION_ADMIN: [
        // Dashboard and children
        { menuCode: 'DASHBOARD', permissions: ['READ'] },
        { menuCode: 'OVERALL_PERFORMANCE', permissions: ['READ'] },
        {
          menuCode: 'MONTHLY_PRODUCTION_PERFORMANCE',
          permissions: ['READ', 'EXPORT'],
        },
        { menuCode: 'CCR_HOURLY', permissions: ['READ'] },
        {
          menuCode: 'HAULING_PERFORMANCE',
          permissions: ['READ', 'UPDATE', 'DELETE', 'EXPORT'],
        },
        {
          menuCode: 'BARGING_PERFORMANCE',
          permissions: ['READ', 'UPDATE', 'DELETE', 'EXPORT'],
        },
        // View Data
        { menuCode: 'VIEW_DATA_PAGE', permissions: ['READ'] },
        { menuCode: 'CONTROL_PAGE', permissions: ['READ'] },
        { menuCode: 'CONTROL_DAY_PRODUCTION', permissions: ['READ', 'EXPORT'] },
        { menuCode: 'CONTROL_DAY_WORK_HOUR', permissions: ['READ', 'EXPORT'] },
        {
          menuCode: 'CONTROL_SHIFT_PRODUCTION',
          permissions: ['READ', 'EXPORT'],
        },
        {
          menuCode: 'CONTROL_SHIFT_WORK_HOUR',
          permissions: ['READ', 'EXPORT'],
        },
        { menuCode: 'SUMMARY_PRODUCTION', permissions: ['READ', 'EXPORT'] },
        { menuCode: 'ANALYSIS_BARGE_HAULING', permissions: ['READ', 'EXPORT'] },
        // Entry Data
        { menuCode: 'ENTRY_DATA_PAGE', permissions: ['READ'] },
        { menuCode: 'MTD_PRODUCTION', permissions: ['READ'] },
        {
          menuCode: 'PRODUCTION_LIST',
          permissions: ['READ', 'UPDATE', 'EXPORT'],
        },
        {
          menuCode: 'LOSS_TIME_LIST',
          permissions: ['READ', 'UPDATE', 'EXPORT'],
        },
        { menuCode: 'BARGE_LIST', permissions: ['READ', 'UPDATE', 'EXPORT'] },
        {
          menuCode: 'FUEL_CONSUMPTION_LIST',
          permissions: ['READ', 'UPDATE', 'EXPORT'],
        },
        { menuCode: 'CCR_HOURLY_ENTRY', permissions: ['READ'] },
        {
          menuCode: 'CCR_HAULING_LIST',
          permissions: ['READ', 'UPDATE', 'EXPORT'],
        },
        {
          menuCode: 'CCR_BARGING_LIST',
          permissions: ['READ', 'UPDATE', 'EXPORT'],
        },
        {
          menuCode: 'CCR_PROBLEM_HAULING_LIST',
          permissions: ['READ', 'UPDATE', 'EXPORT'],
        },
        {
          menuCode: 'CCR_PROBLEM_BARGING_LIST',
          permissions: ['READ', 'UPDATE', 'EXPORT'],
        },
        // Master Data
        { menuCode: 'MASTER_DATA_PAGE', permissions: ['READ'] },
        { menuCode: 'UNIT_TYPE', permissions: ['READ', 'UPDATE'] },
        { menuCode: 'COA_POPULATION_LIST', permissions: ['READ', 'UPDATE'] },
        { menuCode: 'SITES', permissions: ['READ', 'UPDATE'] },
        { menuCode: 'ACTIVITIES', permissions: ['READ', 'UPDATE'] },
        { menuCode: 'USER', permissions: ['READ', 'UPDATE'] },
        { menuCode: 'EMPLOYEE', permissions: ['READ', 'UPDATE'] },
        { menuCode: 'BARGE', permissions: ['READ', 'UPDATE'] },
        { menuCode: 'BRAND', permissions: ['READ', 'UPDATE'] },
        // Profile
        { menuCode: 'PROFILE', permissions: ['READ'] },
        {
          menuCode: 'MY_PROFILE',
          permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        },
      ],
      MANAGEMENT: [
        { menuCode: 'DASHBOARD', permissions: ['READ'] },
        { menuCode: 'OVERALL_PERFORMANCE', permissions: ['READ'] },
        {
          menuCode: 'MONTHLY_PRODUCTION_PERFORMANCE',
          permissions: ['READ', 'EXPORT'],
        },
        { menuCode: 'CCR_HOURLY', permissions: ['READ'] },
        {
          menuCode: 'HAULING_PERFORMANCE',
          permissions: ['READ', 'UPDATE', 'DELETE', 'EXPORT'],
        },
        {
          menuCode: 'BARGING_PERFORMANCE',
          permissions: ['READ', 'UPDATE', 'DELETE', 'EXPORT'],
        },
        { menuCode: 'PROFILE', permissions: ['READ'] },
        {
          menuCode: 'MY_PROFILE',
          permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        },
      ],
      CCR: [
        { menuCode: 'DASHBOARD', permissions: ['READ'] },
        { menuCode: 'OVERALL_PERFORMANCE', permissions: ['READ'] },
        {
          menuCode: 'MONTHLY_PRODUCTION_PERFORMANCE',
          permissions: ['READ', 'EXPORT'],
        },
        { menuCode: 'CCR_HOURLY', permissions: ['READ'] },
        {
          menuCode: 'HAULING_PERFORMANCE',
          permissions: ['READ', 'UPDATE', 'DELETE', 'EXPORT'],
        },
        {
          menuCode: 'BARGING_PERFORMANCE',
          permissions: ['READ', 'UPDATE', 'DELETE', 'EXPORT'],
        },
        { menuCode: 'ENTRY_DATA_PAGE', permissions: ['READ'] },
        { menuCode: 'WORK_PLAN', permissions: ['READ'] },
        {
          menuCode: 'DAILY_WORKING_HOUR_PLAN_LIST',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        {
          menuCode: 'SETTINGS_DAILY_WORKING_HOUR_PLAN',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        {
          menuCode: 'DAILY_PRODUCTION_PLAN_LIST',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        {
          menuCode: 'SETTINGS_DAILY_PRODUCTION_PLAN',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        { menuCode: 'MTD_PRODUCTION', permissions: ['READ'] },
        {
          menuCode: 'PRODUCTION_LIST',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        {
          menuCode: 'LOSS_TIME_LIST',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        {
          menuCode: 'BARGE_LIST',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        {
          menuCode: 'FUEL_CONSUMPTION_LIST',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        { menuCode: 'CCR_HOURLY_ENTRY', permissions: ['READ'] },
        {
          menuCode: 'CCR_HAULING_LIST',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        {
          menuCode: 'CCR_BARGING_LIST',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        {
          menuCode: 'CCR_PROBLEM_HAULING_LIST',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        {
          menuCode: 'CCR_PROBLEM_BARGING_LIST',
          permissions: [
            'CREATE',
            'READ',
            'UPDATE',
            'DELETE',
            'EXPORT',
            'IMPORT',
          ],
        },
        { menuCode: 'MASTER_DATA_PAGE', permissions: ['READ'] },
        {
          menuCode: 'UNIT_TYPE',
          permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        },
        {
          menuCode: 'COA_POPULATION_LIST',
          permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        },
        {
          menuCode: 'SITES',
          permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        },
        {
          menuCode: 'ACTIVITIES',
          permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        },
        {
          menuCode: 'BARGE',
          permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        },
        {
          menuCode: 'BRAND',
          permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        },
        { menuCode: 'PROFILE', permissions: ['READ'] },
        {
          menuCode: 'MY_PROFILE',
          permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
        },
      ],
    };

    // Build helpers
    const perms = await this.dataSource.query(
      'SELECT id, permission_code FROM m_permission',
    );
    const permCodeToId = new Map(
      perms.map((p: any) => [p.permission_code, p.id]),
    );
    const menus = await this.dataSource.query(
      'SELECT id, menu_code FROM m_menu',
    );
    const menuCodeToId = new Map(menus.map((m: any) => [m.menu_code, m.id]));

    const ensureRolePermissions = async (roleCode: string) => {
      const role = await rolesRepository.findOne({
        where: { role_code: roleCode },
      });
      if (!role) return;
      const mappings = roleAccessMap[roleCode] || [];
      let created = 0;
      let skipped = 0;

      for (const map of mappings) {
        const menuId = menuCodeToId.get(map.menuCode);
        if (!menuId) {
          console.log(`⚠️ Menu not found: ${map.menuCode}`);
          continue;
        }
        for (const pc of map.permissions) {
          const permissionId = permCodeToId.get(pc);
          if (!permissionId) {
            console.log(`⚠️ Permission not found: ${pc}`);
            continue;
          }
          const mhp = await this.dataSource.query(
            'SELECT id FROM r_menu_has_permission WHERE menu_id = $1 AND permission_id = $2',
            [menuId, permissionId],
          );
          if (mhp.length === 0) {
            console.log(
              `⚠️ Menu-permission combo not found, skip: ${map.menuCode} -> ${pc}`,
            );
            continue;
          }
          const mhpId = mhp[0].id;
          const exists = await this.dataSource.query(
            'SELECT 1 FROM r_role_has_permission WHERE role_id = $1 AND mhp_id = $2 AND permission_id = $3',
            [role.id, mhpId, permissionId],
          );
          if (exists.length === 0) {
            await this.dataSource.query(
              'INSERT INTO r_role_has_permission (role_id, mhp_id, permission_id, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
              [role.id, mhpId, permissionId],
            );
            created++;
          } else {
            skipped++;
          }
        }
      }
      console.log(
        `✅ Role ${roleCode} permissions set. Created: ${created}, Skipped: ${skipped}`,
      );
    };

    await ensureRolePermissions('PRODUCTION_ADMIN');
    await ensureRolePermissions('MANAGEMENT');
    await ensureRolePermissions('CCR');

    // Assign user-role
    const assignUserRole = async (username: string, roleCode: string) => {
      const userRows = await this.dataSource.query(
        'SELECT id FROM m_user WHERE username = $1',
        [username],
      );
      const roleRows = await this.dataSource.query(
        'SELECT id FROM m_role WHERE role_code = $1',
        [roleCode],
      );
      if (userRows.length === 0 || roleRows.length === 0) {
        console.log(
          `⚠️ Cannot assign role. Missing user or role: ${username} -> ${roleCode}`,
        );
        return;
      }
      const userId = userRows[0].id;
      const roleId = roleRows[0].id;
      const exists = await this.dataSource.query(
        'SELECT 1 FROM r_user_role WHERE user_id = $1 AND role_id = $2',
        [userId, roleId],
      );
      if (exists.length === 0) {
        await this.dataSource.query(
          'INSERT INTO r_user_role (user_id, role_id, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
          [userId, roleId],
        );
        console.log(`✅ Assigned ${username} -> ${roleCode}`);
      } else {
        console.log(`⏭️  Assignment exists ${username} -> ${roleCode}`);
      }
    };

    await assignUserRole('productionadmin', 'PRODUCTION_ADMIN');
    await assignUserRole('management', 'MANAGEMENT');
    await assignUserRole('ccr', 'CCR');

    console.log(
      '🎉 Custom roles, users, and access mappings seeding completed.',
    );
  }
}
