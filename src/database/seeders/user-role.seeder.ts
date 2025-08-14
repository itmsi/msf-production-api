import { DataSource } from 'typeorm';
import { Users } from '../../modules/users/entities/users.entity';
import { Roles } from '../../modules/roles/entities/roles.entity';

export class UserRoleSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const usersRepository = this.dataSource.getRepository(Users);
    const rolesRepository = this.dataSource.getRepository(Roles);

    // Get existing users and roles
    const users = await usersRepository.find();
    const roles = await rolesRepository.find();

    if (users.length === 0) {
      console.log('❌ No users found. Please run users seeder first.');
      return;
    }

    if (roles.length === 0) {
      console.log('❌ No roles found. Please run roles seeder first.');
      return;
    }

    // Create user-role relationships
    const userRoleData = [
      // Super Admin - gets all roles
      { username: 'superadmin', roleCode: 'SUPER_ADMIN' },
      
      // Admin - gets admin and below roles
      { username: 'admin', roleCode: 'ADMIN' },
      { username: 'admin', roleCode: 'MANAGER' },
      { username: 'admin', roleCode: 'STAFF' },
      
      // Manager - gets manager and below roles
      { username: 'manager', roleCode: 'MANAGER' },
      { username: 'manager', roleCode: 'STAFF' },
      
      // Staff users - get staff role only
      { username: 'staff1', roleCode: 'STAFF' },
      { username: 'staff2', roleCode: 'STAFF' },
      { username: 'operator1', roleCode: 'STAFF' },
      { username: 'viewer1', roleCode: 'STAFF' },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const userRole of userRoleData) {
      const user = await usersRepository.findOne({ where: { username: userRole.username } });
      const role = await rolesRepository.findOne({ where: { roleCode: userRole.roleCode } });

      if (user && role) {
        // Check if relationship already exists
        const existingRelation = await this.dataSource.query(
          'SELECT * FROM r_user_role WHERE user_id = $1 AND role_id = $2',
          [user.id, role.id]
        );

        if (existingRelation.length === 0) {
          // Create new user-role relationship
          await this.dataSource.query(
            'INSERT INTO r_user_role (user_id, role_id, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
            [user.id, role.id]
          );
          createdCount++;
          console.log(`✅ User-role relationship created: ${userRole.username} -> ${userRole.roleCode}`);
        } else {
          skippedCount++;
          console.log(`⏭️  User-role relationship already exists: ${userRole.username} -> ${userRole.roleCode}`);
        }
      } else {
        console.log(`❌ User or role not found: ${userRole.username} -> ${userRole.roleCode}`);
      }
    }

    console.log(`\n📊 User-Role Seeding Summary:`);
    console.log(`   • Created: ${createdCount} relationships`);
    console.log(`   • Skipped: ${skippedCount} existing relationships`);
  }
}
