import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class FixSuperAdminSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🔧 Fixing Super Admin user...');

    try {
      // Check if superadmin user exists
      const existingUser = await this.dataSource.query(
        'SELECT id, username, password FROM m_user WHERE username = $1',
        ['superadmin'],
      );

      if (existingUser.length === 0) {
        console.log('❌ Super Admin user not found. Creating new one...');

        // Get first employee for user creation
        const employees = await this.dataSource.query(
          'SELECT id FROM m_employee LIMIT 1',
        );
        if (employees.length === 0) {
          console.log(
            '❌ No employees found. Please run employee seeder first.',
          );
          return;
        }

        const employeeId = employees[0].id;
        const passwordHash = await bcrypt.hash('Qwer1234!', 10);

        await this.dataSource.query(
          'INSERT INTO m_user (username, email, password, "isActive", employee_id, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
          ['superadmin', 'superadmin@msf.com', passwordHash, true, employeeId],
        );

        console.log('✅ Super Admin user created with password: Qwer1234!');
      } else {
        console.log('✅ Super Admin user found. Updating password...');

        // Update password to Qwer1234!
        const passwordHash = await bcrypt.hash('Qwer1234!', 10);

        await this.dataSource.query(
          'UPDATE m_user SET password = $1, "updatedAt" = NOW() WHERE username = $2',
          [passwordHash, 'superadmin'],
        );

        console.log('✅ Super Admin password updated to: Qwer1234!');
      }

      // Ensure role exists
      const existingRole = await this.dataSource.query(
        'SELECT id FROM m_role WHERE role_code = $1',
        ['SUPER_ADMIN'],
      );

      if (existingRole.length === 0) {
        console.log(
          '❌ Super Admin role not found. Please run role seeder first.',
        );
        return;
      }

      // Ensure user-role relationship exists
      const userId = await this.dataSource.query(
        'SELECT id FROM m_user WHERE username = $1',
        ['superadmin'],
      );

      if (userId.length === 0) {
        console.log('❌ Super Admin user not found after creation.');
        return;
      }

      const existingUserRole = await this.dataSource.query(
        'SELECT * FROM r_user_role WHERE user_id = $1 AND role_id = $2',
        [userId[0].id, existingRole[0].id],
      );

      if (existingUserRole.length === 0) {
        await this.dataSource.query(
          'INSERT INTO r_user_role (user_id, role_id, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
          [userId[0].id, existingRole[0].id],
        );
        console.log('✅ User-role relationship created for Super Admin');
      } else {
        console.log('✅ User-role relationship already exists for Super Admin');
      }

      console.log('🎉 Super Admin user fixed successfully!');
      console.log('🔑 Credentials: superadmin / Qwer1234!');
    } catch (error) {
      console.error('❌ Error fixing Super Admin user:', error);
      throw error;
    }
  }
}
