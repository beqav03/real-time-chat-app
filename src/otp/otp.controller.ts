import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { OtpService } from './otp.service';
import { Throttle } from '@nestjs/throttler';
import { ResendOtpDto } from './dtos/verify-otp.dto';
import { SanitizePipe } from 'src/pipes/sanitize.pipe';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('otp')
@UsePipes(SanitizePipe)
@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService) {}

    @ApiOperation({ summary: 'Resend OTP' })
    @ApiResponse({ status: 200, description: 'OTP resent successfully' })
    @Post('resend')
    @Throttle({ default: { limit: 5, ttl: 60 } })
    async resendOtp(@Body() data: ResendOtpDto) {
        return this.otpService.resendOneTimeCode(+data.pendingId);
    }
}