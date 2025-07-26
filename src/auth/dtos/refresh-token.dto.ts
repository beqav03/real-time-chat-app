import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class RefreshTokenDto {
    @IsString({ message: 'Refresh token must be a string' })
    @IsNotEmpty({ message: 'Refresh token cannot be empty' })
    @ApiProperty({
        description: 'Refresh token for renewing access',
        example: '1234567890abcdef',
    })
    readonly refreshToken: string;
}

export class LogoutDto {
    @IsInt({ message: 'User ID must be an integer' })
    @IsNotEmpty({ message: 'User ID cannot be empty' })
    @ApiProperty({
        description: 'ID of the user logging out',
        example: 12345,
    })
    readonly userId: number;
}