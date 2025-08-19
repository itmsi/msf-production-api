import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class UserSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    // Get first employee for user creation
    const employees = await this.dataSource.query(
      'SELECT id FROM m_employee LIMIT 1',
    );
    if (employees.length === 0) {
      console.log('❌ No employees found. Please run employee seeder first.');
      return;
    }
    const defaultEmployeeId = employees[0].id;

    const usersData = [
      {
        username: 'superadmin',
        email: 'superadmin@msf.com',
        password: 'Qwer1234!',
        employeeId: defaultEmployeeId,
        isActive: true,
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of usersData) {
      // Check if user already exists
      const existingUser = await this.dataSource.query(
        'SELECT * FROM m_user WHERE username = $1 OR email = $2',
        [userData.username, userData.email],
      );

      if (existingUser.length === 0) {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Create new user
        await this.dataSource.query(
          'INSERT INTO m_user (username, email, password, "isActive", employee_id, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
          [
            userData.username,
            userData.email,
            hashedPassword,
            userData.isActive,
            userData.employeeId,
          ],
        );
        createdCount++;
        console.log(`✅ User created: ${userData.username}`);
      } else {
        skippedCount++;
        console.log(`⏭️  User already exists: ${userData.username}`);
      }
    }

    console.log(`\n📊 User Seeding Summary:`);
    console.log(`   • Created: ${createdCount} users`);
    console.log(`   • Skipped: ${skippedCount} existing users`);

    if (createdCount > 0) {
      console.log('\n🔑 User Credentials:');
      console.log(`   • Username: superadmin`);
      console.log(`   • Password: Qwer1234!`);
    }
  }
}
