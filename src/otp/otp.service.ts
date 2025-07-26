import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { OtpRepository } from './otp.repository';
import { ConfigService } from '@nestjs/config';
import { OtpCode } from './entities/otp-code.entity';
import { CryptoUtils } from 'src/utils/crypto.util';
import { Transporter } from 'nodemailer';

@Injectable()
export class OtpService {
    private readonly otpExpiration = 300;
    private readonly rateLimitSeconds = 60; 
    private readonly maxAttempts = 3;

    constructor(
        private readonly otpRepo: OtpRepository,
        private readonly configService: ConfigService,
        @Inject('EMAIL_TRANSPORTER') private readonly emailTransporter: Transporter,
    ) {}

    async sendOneTimeCode(email: string): Promise<number> {

        const lastOtp = await this.otpRepo.findLatestByEmail(email);
        if (lastOtp && this.isWithinRateLimitWindow(lastOtp.createdAt)) {
            throw new BadRequestException(`Please wait ${this.rateLimitSeconds} seconds before requesting a new code`);
        }

        const code = CryptoUtils.generateOtpCode();
        const codeHash = await CryptoUtils.hashString(code, this.configService);
        const expiresAt = new Date(Date.now() + this.otpExpiration * 1000);

        const otp = await this.otpRepo.create({
            email: email,
            codeHash,
            expiresAt,
        });

        await this.emailTransporter.sendMail({
            from: this.configService.get<string>('EMAIL_FROM_ADDRESS'),
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${code}`,
        });

        return otp.id;
    }

    async verifyOneTimeCode(pendingId: number, enteredCode: string): Promise<boolean> {
        const otpRecord = await this.otpRepo.findOneTimeCode(pendingId);

        if (!otpRecord) {
            throw new BadRequestException('Invalid OTP request');
        }

        if (new Date() > otpRecord.expiresAt) {
            throw new BadRequestException('OTP has expired');
        }

        if (otpRecord.isUsed) {
            throw new BadRequestException('OTP has already been used');
        }

        if (otpRecord.attemptCount >= this.maxAttempts) {
            throw new BadRequestException('Maximum attempts reached. Please request a new OTP.');
        }

        const isValid = await CryptoUtils.compareHash(enteredCode, otpRecord.codeHash);

        if (!isValid) {
            await this.otpRepo.incrementAttemptCount(otpRecord.id);
            throw new BadRequestException('Invalid OTP code');
        }

        await this.otpRepo.markAsUsed(otpRecord.id);
        return true;
    }

    async resendOneTimeCode(pendingId: number): Promise<number> {
        const otpRecord = await this.otpRepo.findOneTimeCode(pendingId);
        if (!otpRecord) {
            throw new BadRequestException('Invalid OTP request');
        }

        if (otpRecord.isUsed) {
            throw new BadRequestException('OTP has already been used');
        }

        if (this.isWithinRateLimitWindow(otpRecord.createdAt)) {
            throw new BadRequestException(`Please wait ${this.rateLimitSeconds} seconds before resending`);
        }

        const code = CryptoUtils.generateOtpCode();
        const codeHash = await CryptoUtils.hashString(code, this.configService);
        const expiresAt = new Date(Date.now() + this.otpExpiration * 1000);

        const newOtp = await this.otpRepo.create({
            email: otpRecord.contactId,
            codeHash,
            expiresAt,
        });

        await this.emailTransporter.sendMail({
            from: this.configService.get<string>('EMAIL_FROM_ADDRESS'),
            to: otpRecord.contactId,
            subject: 'Your New Verification Code',
            text: `Your new verification code is: ${code}`,
        });

        return newOtp.id;
    }

    async findOneTimeCode(pendingId: number): Promise<OtpCode | null> {
        return this.otpRepo.findOneTimeCode(pendingId);
    }

    private isWithinRateLimitWindow(createdAt: Date): boolean {
        return Date.now() - createdAt.getTime() < this.rateLimitSeconds * 1000;
    }
}