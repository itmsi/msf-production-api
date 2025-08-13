import { DataSource } from 'typeorm';
import { Users } from '../../modules/users/entities/users.entity';
import { Roles } from '../../modules/roles/entities/roles.entity';
import { Employee } from '../../master/employee/entities/employee.entity';
import { Sites } from '../../master/sites/entities/sites.entity';
import * as bcrypt from 'bcrypt';

export class UsersSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const usersRepository = this.dataSource.getRepository(Users);
    const rolesRepository = this.dataSource.getRepository(Roles);
    const employeeRepository = this.dataSource.getRepository(Employee);
    const sitesRepository = this.dataSource.getRepository(Sites);

    // Get existing roles, employees, and sites
    const superAdminRole = await rolesRepository.findOne({ where: { roleCode: 'SUPER_ADMIN' } });
    const adminRole = await rolesRepository.findOne({ where: { roleCode: 'ADMIN' } });
    const managerRole = await rolesRepository.findOne({ where: { roleCode: 'MANAGER' } });
    const staffRole = await rolesRepository.findOne({ where: { roleCode: 'STAFF' } });

    const siteJakarta = await sitesRepository.findOne({ where: { name: 'Site Jakarta' } });
    const siteSurabaya = await sitesRepository.findOne({ where: { name: 'Site Surabaya' } });

    const employees = await employeeRepository.find();

    if (!superAdminRole || !adminRole || !managerRole || !staffRole) {
      console.log('❌ Required roles not found. Please run roles seeder first.');
      return;
    }

    if (!siteJakarta || !siteSurabaya) {
      console.log('❌ Required sites not found. Please run sites seeder first.');
      return;
    }

    if (employees.length === 0) {
      console.log('❌ No employees found. Please run employee seeder first.');
      return;
    }

    const usersData = [
      {
        username: 'superadmin',
        password: 'superadmin123',
        email: 'superadmin@msf.com',
        roleId: superAdminRole.id,
        employee_id: employees[0].id,
        sites_id: siteJakarta.id,
        isActive: true,
      },
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@msf.com',
        roleId: adminRole.id,
        employee_id: employees[1].id,
        sites_id: siteJakarta.id,
        isActive: true,
      },
      {
        username: 'manager',
        password: 'manager123',
        email: 'manager@msf.com',
        roleId: managerRole.id,
        employee_id: employees[2].id,
        sites_id: siteSurabaya.id,
        isActive: true,
      },
      {
        username: 'staff1',
        password: 'staff123',
        email: 'staff1@msf.com',
        roleId: staffRole.id,
        employee_id: employees[3].id,
        sites_id: siteJakarta.id,
        isActive: true,
      },
      {
        username: 'staff2',
        password: 'staff123',
        email: 'staff2@msf.com',
        roleId: staffRole.id,
        employee_id: employees[4].id,
        sites_id: siteSurabaya.id,
        isActive: true,
      },
      {
        username: 'operator1',
        password: 'operator123',
        email: 'operator1@msf.com',
        roleId: staffRole.id,
        employee_id: employees[5].id,
        sites_id: siteJakarta.id,
        isActive: true,
      },
      {
        username: 'viewer1',
        password: 'viewer123',
        email: 'viewer1@msf.com',
        roleId: staffRole.id,
        employee_id: employees[6].id,
        sites_id: siteSurabaya.id,
        isActive: true,
      },
    ];

    for (const userData of usersData) {
      const existingUser = await usersRepository.findOne({
        where: { username: userData.username },
      });

      if (!existingUser) {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = usersRepository.create({
          ...userData,
          password: hashedPassword,
        });
        
        await usersRepository.save(user);
        console.log(`✅ User "${userData.username}" created with password: ${userData.password}`);
      } else {
        console.log(`⏭️  User "${userData.username}" already exists`);
      }
    }
  }
}
