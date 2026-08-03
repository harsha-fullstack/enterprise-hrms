import { Body, Controller, Post, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CreateEmployeeDto } from  './dto/create-employee.dto';
import { EmployeeService } from './employee.service';
import { EmployeeEntity } from './entities/employee.entity';

@Controller('employees')
export class EmployeeController {

    constructor(
        private readonly employeeService: EmployeeService,
    ){}

    @Post()
    create(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.employeeService.create(createEmployeeDto);
    }

    @Get()
    findAll(): Promise<EmployeeEntity[]> {
        return this.employeeService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe) 
        id: number,
    ): Promise<EmployeeEntity> {
        return this.employeeService.findOne(id);
    }
} 