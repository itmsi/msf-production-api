import { DataSource } from 'typeorm';
import { Department } from '../../modules/department/entities/department.entity';

export class DepartmentSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const departmentRepository = this.dataSource.getRepository(Department);

    const departmentsData = [
      {
        name: 'Information Technology',
        description: 'Handles all IT related activities and system development',
      },
      {
        name: 'Human Resources',
        description: 'Manages employee relations, recruitment, and HR policies',
      },
      {
        name: 'Finance',
        description: 'Handles financial planning, accounting, and budget management',
      },
      {
        name: 'Marketing',
        description: 'Responsible for marketing strategies and brand management',
      },
      {
        name: 'Operations',
        description: 'Manages daily operations and process optimization',
      },
      {
        name: 'Sales',
        description: 'Handles sales activities and customer acquisition',
      },
      {
        name: 'Engineering',
        description: 'Technical engineering and product development',
      },
      {
        name: 'Customer Service',
        description: 'Provides customer support and service excellence',
      },
    ];

    for (const departmentData of departmentsData) {
      const existingDepartment = await departmentRepository.findOne({
        where: { name: departmentData.name },
      });

      if (!existingDepartment) {
        const department = departmentRepository.create(departmentData);
        await departmentRepository.save(department);
        console.log(
          `✅ Department "${departmentData.name}" created`,
        );
      } else {
        console.log(
          `⏭️  Department "${departmentData.name}" already exists`,
        );
      }
    }
  }
}
