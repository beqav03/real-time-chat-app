import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";
import { userRoles } from "src/common/enume/enum";

export class CreateUserCheckDto {
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

    @IsString()
    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsStrongPassword({}, { message: 'Password must be strong' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Password cannot exceed 20 characters' })
    @ApiProperty({
        description: 'Password for the user',
        example: 'Password123!',
    })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Confirm password cannot be empty' })
    @IsStrongPassword({}, { message: 'Confirm password must be strong' })
    @MinLength(8, { message: 'Confirm password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Confirm password cannot exceed 20 characters' })
    @ApiProperty({
        description: 'Confirm password for the user',
        example: 'Password123!',
    })
    confirmPassword: string;

    @IsString()
    @ApiProperty({
        description: 'Role of the user',
        example: 'admin',
    })
    role?: userRoles;
}

export class CreateUserDto extends CreateUserCheckDto {
        @IsString()
    @IsNotEmpty({ message: `Pending ID cannot be empty` })
    @ApiProperty({
        description: 'Pending ID for the login session',
        example: '1234567890abcdef',
    })
    pendingId: string;

    @IsString()
    @IsNotEmpty({ message: 'OTP cannot be empty' })
    @ApiProperty({
        description: 'One-time password for login verification',
        example: '123456',
    })
    otp: string;
}