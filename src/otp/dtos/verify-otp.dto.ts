import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResendOtpDto {
    @IsString({ message: 'Pending ID must be a string' })
    @IsNotEmpty({ message: 'Pending ID cannot be empty' })
    @ApiProperty({
        description: 'Pending ID for the OTP request',
        example: '1234567890',
    })
    pendingId: string;
}
