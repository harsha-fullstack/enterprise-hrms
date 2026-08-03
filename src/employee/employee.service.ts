import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeEntity } from './entities/employee.entity';

@Injectable()
export class EmployeeService {
    
    constructor(
        @InjectRepository(EmployeeEntity)
        private readonly employeeRepository: Repository<EmployeeEntity>,
    ){} 

    async create(createEmployeeDto: CreateEmployeeDto) {
     
        //Normalize email (remove spaces and convert to lowercase)
        const email = createEmployeeDto.email.toLowerCase().trim();

        //Check if employee already exists
        const existingEmployee = await this.employeeRepository.findOne({
            where: {
                email,
            }
        });

        //Duplicate email found
        if (existingEmployee) {
            throw new ConflictException(
                'Employee with this email already exists',
            );
        }

        //Save the Employee in MySQL
        const employee = this.employeeRepository.create({
            firstName: createEmployeeDto.firstName,
            lastName: createEmployeeDto.lastName,
            email,
            mobile: createEmployeeDto.mobile,
            joiningDate: createEmployeeDto.joiningDate,
        });

        const savedEmployee = await this.employeeRepository.save(employee);

        return {
            message: 'Employee created successfully',
            employee: savedEmployee,
        }

    }
    async findAll(): Promise<EmployeeEntity[]> {
        return this.employeeRepository.find();
    }

    async findOne(id: number): Promise<EmployeeEntity> {
        const employee = await this.employeeRepository.findOneBy({
            id,
        });

        if (!employee) {
            throw new NotFoundException(
                 `Employee with ID ${id} not found`,
            );
        }

        return employee;
    }

    


}
