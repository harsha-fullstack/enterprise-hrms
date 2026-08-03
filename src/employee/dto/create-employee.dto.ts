import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsNumber,
    IsDateString,
    Matches,
} from 'class-validator';

export class CreateEmployeeDto {

    @IsNotEmpty()
    @IsString()
    firstName!: string;

    @IsNotEmpty()
    @IsString()
    lastName!: string;

    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^[0-9]{10}$/,{
        message: 'Mobile number must contain exactly 10 digits',

    })
    mobile!: string;

    @IsNotEmpty()
    @IsDateString()
    joiningDate!: string;
}
