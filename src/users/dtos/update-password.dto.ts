import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class UpdatePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsStrongPassword({}, { message: 'Password must be strong' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Password cannot exceed 20 characters' })
    @ApiProperty({
        description: 'New password for the user',
        example: 'newStrongPassword123!',
    })
    oldPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsStrongPassword({}, { message: 'Password must be strong' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Password cannot exceed 20 characters' })
    @ApiProperty({
        description: 'New password for the user',
        example: 'newStrongPassword123!',
    })
    newPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'Confirm password cannot be empty' })
    @IsStrongPassword({}, { message: 'Confirm password must be strong' })
    @MinLength(8, { message: 'Confirm password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Confirm password cannot exceed 20 characters' })
    @ApiProperty({
        description: 'New password for the user',
        example: 'newStrongPassword123!',
    })
    confirmNewPassword: string;
}