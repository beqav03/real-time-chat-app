import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, IsEmail, IsPhoneNumber, MinLength, MaxLength, IsNumberString, IsStrongPassword } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @IsOptional()
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @ApiProperty({
        description: 'Email address of the user',
        example: 'user@example.com',
    })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsStrongPassword()
    @ApiProperty({
        description: 'Password for user authentication',
        example: 'password123',
    })
    password: string;
}

export class VerifyLoginOtpDto {
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