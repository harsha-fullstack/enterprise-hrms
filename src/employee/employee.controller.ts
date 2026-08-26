import { Body, Controller, Post, Get, Param, Patch, Delete, ParseIntPipe, Query, BadRequestException } from '@nestjs/common';
import { CreateEmployeeDto } from  './dto/create-employee.dto';
import { EmployeeService } from './employee.service';
import { EmployeeEntity } from './entities/employee.entity';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

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
    findAll(
        @Query('email') email?: string,
        @Query('mobile') mobile?: string,
        @Query('status') status?: string,
    ): Promise<EmployeeEntity[]> {
        if (email && mobile) {
            throw new BadRequestException(
                'Please Provide either email or mobile, not both'
            );
        }
        if(status && (email || mobile)) {
            throw new BadRequestException(
                'Status cannot be combined with email or mobile',
            );
        }
        if (email) {
            return this.employeeService.findByEmail(email);
        }
        if(mobile) {
            return this.employeeService.findByMobile(mobile);
        }
        if(status) {
            return this.employeeService.findByStatus(status);
        }
        return this.employeeService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ): Promise<EmployeeEntity> {
        return this.employeeService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEmployeeDto: UpdateEmployeeDto,
    ): Promise<EmployeeEntity> {
        return this.employeeService.update(id, updateEmployeeDto);
    }

    @Delete(':id')
    delete(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        return this.employeeService.delete(id);
    }

    @Patch(':id/restore')
    restore(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.employeeService.restore(id);
    }

    @Patch(':id/deactivate')
    deactivate(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.employeeService.deactivate(id);
    }

    @Patch(':id/activate')
    activate(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.employeeService.activate(id);
    }
} 