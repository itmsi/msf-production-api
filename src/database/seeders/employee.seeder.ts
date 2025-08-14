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
        department: 'IT',
        position: 'Senior Developer',
        nip: 1001,
        status: 'active',
        salary: '15000000',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        department: 'HR',
        position: 'HR Manager',
        nip: 1002,
        status: 'active',
        salary: '18000000',
      },
      {
        firstName: 'Michael',
        lastName: 'Johnson',
        department: 'Finance',
        position: 'Finance Director',
        nip: 1003,
        status: 'active',
        salary: '25000000',
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        department: 'Marketing',
        position: 'Marketing Manager',
        nip: 1004,
        status: 'active',
        salary: '20000000',
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        department: 'Operations',
        position: 'Operations Manager',
        nip: 1005,
        status: 'active',
        salary: '22000000',
      },
      {
        firstName: 'Lisa',
        lastName: 'Davis',
        department: 'Sales',
        position: 'Sales Director',
        nip: 1006,
        status: 'active',
        salary: '28000000',
      },
      {
        firstName: 'Robert',
        lastName: 'Wilson',
        department: 'Engineering',
        position: 'Engineering Manager',
        nip: 1007,
        status: 'active',
        salary: '24000000',
      },
      {
        firstName: 'Emily',
        lastName: 'Taylor',
        department: 'Customer Service',
        position: 'Customer Service Manager',
        nip: 1008,
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
        console.log(`✅ Employee "${employeeData.firstName} ${employeeData.lastName}" created`);
      } else {
        console.log(`⏭️  Employee "${employeeData.firstName} ${employeeData.lastName}" already exists`);
      }
    }
  }
}
