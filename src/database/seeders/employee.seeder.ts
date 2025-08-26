import { DataSource } from 'typeorm';
import { Employee } from '../../modules/employee/entities/employee.entity';

export class EmployeeSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const employeeRepository = this.dataSource.getRepository(Employee);

    const employeesData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        departmentId: 1, // IT Department
        position: 'Senior Developer',
        nip: 'EMP001',
        status: 'active',
        salary: '15000000',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        departmentId: 2, // HR Department
        position: 'HR Manager',
        nip: 'EMP002',
        status: 'active',
        salary: '18000000',
      },
      {
        firstName: 'Michael',
        lastName: 'Johnson',
        departmentId: 3, // Finance Department
        position: 'Finance Director',
        nip: 'EMP003',
        status: 'active',
        salary: '25000000',
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        departmentId: 4, // Marketing Department
        position: 'Marketing Manager',
        nip: 'EMP004',
        status: 'active',
        salary: '20000000',
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        departmentId: 5, // Operations Department
        position: 'Operations Manager',
        nip: 'EMP005',
        status: 'active',
        salary: '22000000',
      },
      {
        firstName: 'Lisa',
        lastName: 'Davis',
        departmentId: 6, // Sales Department
        position: 'Sales Director',
        nip: 'EMP006',
        status: 'active',
        salary: '28000000',
      },
      {
        firstName: 'Robert',
        lastName: 'Wilson',
        departmentId: 7, // Engineering Department
        position: 'Engineering Manager',
        nip: 'EMP007',
        status: 'active',
        salary: '24000000',
      },
      {
        firstName: 'Emily',
        lastName: 'Taylor',
        departmentId: 8, // Customer Service Department
        position: 'Customer Service Manager',
        nip: 'EMP008',
        status: 'active',
        salary: '16000000',
      },
    ];

    for (const employeeData of employeesData) {
      const existingEmployee = await employeeRepository.findOne({
        where: { nip: employeeData.nip },
      });

      if (!existingEmployee) {
        const employee = employeeRepository.create(employeeData);
        await employeeRepository.save(employee);
        console.log(
          `✅ Employee "${employeeData.firstName} ${employeeData.lastName}" created`,
        );
      } else {
        console.log(
          `⏭️  Employee "${employeeData.firstName} ${employeeData.lastName}" already exists`,
        );
      }
    }
  }
}
