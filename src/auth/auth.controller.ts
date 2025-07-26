import { Controller, Post, Body, UseGuards, UsePipes, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto, LogoutDto } from './dtos/refresh-token.dto';
import { JwtGuard } from './guards/jwt.guard';
import { Throttle } from '@nestjs/throttler';
import { RequestPasswordResetDto } from './dtos/password-reset.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserGuard } from './guards/user.guard';
import { SanitizePipe } from 'src/pipes/sanitize.pipe';

@ApiTags('auth')
@Controller('auth')
@UsePipes(SanitizePipe)
export class AuthController {
    constructor( private readonly authService: AuthService ) {}

    @ApiOperation({ summary: 'Login with email' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60 } })
    async login(@Body() data: LoginDto) {
        return await this.authService.checkLoginEmail(data.email, data.password);
    }

    @ApiOperation({ summary: 'Refresh JWT token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @Post('refreshToken')
    @Throttle({ default: { limit: 5, ttl: 60 } })
    async refreshToken(@Body() data: RefreshTokenDto) {
        return await this.authService.refreshToken(data);
    }

    @ApiOperation({ summary: 'Request password reset' })
    @ApiResponse({ status: 200, description: 'Password reset request successful' })
    @Post('reset-password/request')
    @Throttle({ default: { limit: 5, ttl: 60 } })
    async requestPasswordReset(@Body() data: RequestPasswordResetDto) {
        return await this.authService.requestPasswordReset(data);
    }

    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    @Post('logout')
    @UseGuards(JwtGuard, UserGuard)
    @Throttle({ default: { limit: 5, ttl: 60 } })
    async logout(@Body() data: LogoutDto) {
        return await this.authService.logout(data);
    }
}