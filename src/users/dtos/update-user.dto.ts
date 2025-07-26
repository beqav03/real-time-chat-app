import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    @IsNotEmpty({ message: 'Name cannot be empty' })
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(30, { message: 'Name cannot exceed 30 characters' })
    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe',
    })
    name: string;

    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @ApiProperty({
        description: 'Email address of the user',
        example: 'user@example.com',
    })
    email: string;
}