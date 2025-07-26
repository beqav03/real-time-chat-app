
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsStrongPassword, MinLength, MaxLength, IsEmail, IsNumberString, IsOptional } from 'class-validator';

export class VerifyPasswordResetDto {
    @IsString()
    @IsNotEmpty({ message: 'Pending ID cannot be empty' })
    @ApiProperty({
        description: 'Pending ID for the password reset session',
        example: '1234567890abcdef',
    })
    pendingId: string;

    @IsString()
    @IsNotEmpty({ message: 'OTP cannot be empty' })
    @MinLength(6, { message: 'OTP must be at least 6 digits long' })
    @MaxLength(6, { message: 'OTP cannot exceed 6 digits' })
    @ApiProperty({
        description: 'One-time password for verification',
        example: '123456',
    })
    otp: string;

    @IsString()
    @IsNotEmpty({ message: 'New password cannot be empty' })
    @IsStrongPassword({}, { message: 'New password must be strong' })
    @MinLength(8, { message: 'New password must be at least 8 characters long' })
    @MaxLength(20, { message: 'New password cannot exceed 20 characters' })
    @ApiProperty({
        description: 'New password for the user',
        example: 'NewPassword123!',
    })
    newPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'Confirm password cannot be empty' })
    @IsStrongPassword({}, { message: 'Confirm password must be strong' })
    @MinLength(8, { message: 'Confirm password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Confirm password cannot exceed 20 characters' })
    @ApiProperty({
        description: 'Confirm password for the user',
        example: 'NewPassword123!',
    })
    confirmPassword: string;
}

export class RequestPasswordResetDto {
    @IsString()
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsEmail({ allow_display_name: false }, { message: 'Email must be a valid email address' })
    @IsOptional()
    @ApiProperty({
        description: 'Email address of the user requesting password reset',
        example: 'user@example.com',
    })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'New password cannot be empty' })
    @IsStrongPassword({}, { message: 'New password must be strong' })
    @MinLength(8, { message: 'New password must be at least 8 characters long' })
    @MaxLength(20, { message: 'New password cannot exceed 20 characters' })
    @ApiProperty({
        description: 'New password for the user',
        example: 'NewPassword123!',
    })
    newPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'Confirm password cannot be empty' })
    @IsStrongPassword({}, { message: 'Confirm password must be strong' })
    @MinLength(8, { message: 'Confirm password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Confirm password cannot exceed 20 characters' })
    @ApiProperty({
        description: 'Confirm password for the user',
        example: 'NewPassword123!',
    })
    confirmPassword: string;
}