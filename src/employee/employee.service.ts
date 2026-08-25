import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeEntity, EmployeeStatus } from './entities/employee.entity';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {

    constructor(
        @InjectRepository(EmployeeEntity)
        private readonly employeeRepository: Repository<EmployeeEntity>,
    ) { }

    async create(createEmployeeDto: CreateEmployeeDto) {

        //Normalize email (remove spaces and convert to lowercase)
        const email = createEmployeeDto.email.toLowerCase().trim();

        //Check if employee already exists
        const existingEmployee = await this.employeeRepository.findOneBy({
            email,
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
        };
    }

    //Get ALL Employees
    async findAll(): Promise<EmployeeEntity[]> {
        return this.employeeRepository.find();
    }

    //Get Employee By ID
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

    //Update Employee
    async update(
        id: number,
        updateEmployeeDto: UpdateEmployeeDto,
    ): Promise<EmployeeEntity> {
        //Reuse existing method
        const employee = await this.findOne(id);

        //Check duplicate email (only if email is being updated)
        if (updateEmployeeDto.email) {
            const email = updateEmployeeDto.email.trim().toLowerCase();

            const existingEmployee = await this.employeeRepository.findOne({
                where: { email },
            });

            //Another employee already use this email
            if (existingEmployee && existingEmployee.id !== id) {
                throw new ConflictException(
                    'Employee with this email already exists'
                );
            }
            //Store normalized email
            updateEmployeeDto.email = email;
        }

        //Step 3: Merge updated fields
        this.employeeRepository.merge(employee, updateEmployeeDto);

        //Step 4: Save chnages
        return await this.employeeRepository.save(employee);
    }

    async delete(id: number) {
        const employee = await this.findOne(id);

        await this.employeeRepository.softDelete(employee.id);

        return {
            message: 'Employee deleted successfully',
        };
    }

    async restore(id: number): Promise<{ message: string }> {

        //find the employees even if it has been soft-deleted
        const employee = await this.employeeRepository.findOne({
            where: { id },
            withDeleted: true, //include deleted employees
        });

        //Employee doesn't exist
        if (!employee) {
            throw new NotFoundException(
                `Employee with ID ${id} not found`,
            );
        }

        //Employee Already Active
        if (!employee.deletedAt) {
            throw new ConflictException(
                'Employee is already active',
            );
        }

        //Restore
        await this.employeeRepository.restore(id);

        return {
            message: 'Employee restored successfully',
        };
    }

    //Search by email
    async findByEmail(email: string): Promise<EmployeeEntity[]> {
        const normalizedEmail = email.trim().toLowerCase();
        const employee = await this.employeeRepository.findOneBy({
            email: normalizedEmail,
        });
        if (!employee) {
            throw new NotFoundException(
                `Employee with email ${email} not found`,
            );
        }
        return [employee];
    }

    //Search by mobile
    async findByMobile(mobile: string): Promise<EmployeeEntity[]> {
        const employee = await this.employeeRepository.findOneBy({
            mobile,
        });
        if (!employee) {
            throw new NotFoundException(
                `Employee with mobile ${mobile} not found`,
            );
        }
        return [employee];
    }

    async deactivate(id: number): Promise<EmployeeEntity> {
        const employee = await this.employeeRepository.findOne({
            where: { id },
            withDeleted: true,
        });


        if (!employee) {
            throw new NotFoundException(
                `Employee with ID ${id} not found`,
            );
        }

        if (employee.deletedAt) {
            throw new ConflictException(
                'Employee is already soft-deleted',
            );
        }

        if (employee.status === EmployeeStatus.INACTIVE) {
            throw new ConflictException(
                'Employee is already inactive',
            );
        }

        employee.status = EmployeeStatus.INACTIVE;

        await this.employeeRepository.save(employee);

        return employee;
    }

    async activate(id: number): Promise<EmployeeEntity> {
        const employee = await this.employeeRepository.findOne(
            {
                where: { id },
                withDeleted: true,
            });

        if (!employee) {
            throw new NotFoundException(
                `Employee with ID ${id} not found`,
            );
        }
        if (employee.deletedAt) {
            throw new ConflictException(
                'Employee is already soft deleted',
            );
        }

        if (employee.status === EmployeeStatus.ACTIVE) {
            throw new ConflictException(
                'Employee is already active',
            );
        }

        employee.status = EmployeeStatus.ACTIVE;

        await this.employeeRepository.save(employee);

        return employee;
    }
}
