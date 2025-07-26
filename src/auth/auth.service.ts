import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto, LogoutDto } from './dtos/refresh-token.dto';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { Validators } from 'src/common/validators';
import { RequestPasswordResetDto, VerifyPasswordResetDto } from './dtos/password-reset.dto';
import { CryptoUtils } from 'src/utils/crypto.util';
import { AuditLogService } from 'src/audit/audit-log.service';
import { UsersService } from 'src/users/users.service';
import { userStatus } from 'src/common/enume/enum';
import { OtpService } from 'src/otp/otp.service';
import { VerifyLoginOtpDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly refreshTokenRepo: RefreshTokenRepository,
        private readonly otpService: OtpService,
        private readonly configService: ConfigService,
        private readonly auditLogService: AuditLogService
    ) {}

    async checkLoginEmail(email: string, password: string) {
        if (!Validators.isValidEmail(email)) {
            throw new BadRequestException('Invalid email format');
        }
        const user = await this.usersService.findByEmail(email);
        if (!user || user.status !== userStatus.ACTIVE) {
            throw new UnauthorizedException('Invalid user');
        }
        const isPasswordValid = await CryptoUtils.compareHash(password, user.password);
        if (!isPasswordValid) {
            await this.usersService.updateAttempts(user.id, user.loginAttempts += 1);

            throw new UnauthorizedException(`Login attempt failed: Incorrect password for identifier ${email}`);
        }
        
        const pendingId = await this.otpService.sendOneTimeCode(email);
        return { pendingId, message: 'OTP sent to email' };
    }

    async verifyLogin(data: VerifyLoginOtpDto) {
        const { pendingId, otp } = data;

        const checkOtp = await this.otpService.verifyOneTimeCode(+pendingId, otp.toString());
        if (!checkOtp) {
            throw new BadRequestException('Invalid OTP');
        }

        const  contact = await this.otpService.findOneTimeCode(+pendingId);
        if (!contact) {
            throw new BadRequestException('Invalid OTP');
        }

        const user = await this.usersService.findByEmail(contact.contactId);
        if (!user || user.status !== userStatus.ACTIVE) {
            throw new UnauthorizedException('Invalid credentials');
        }

        await this.usersService.updateAttempts(user.id, 0);
        await this.auditLogService.log('User login', user.id, {
            contactId: contact.contactId,
            pendingId: +pendingId,
        });

        const payload = { sub: user.id, role: user.role, email: user.email };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
        });

        const refreshToken = uuidv4();
        const refreshTokenExpiresAt = new Date();
        refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);
        await this.refreshTokenRepo.create(user.id, refreshToken, refreshTokenExpiresAt);

        return { accessToken, refreshToken, message: 'Login successful' };
    }

    async refreshToken(data: RefreshTokenDto) {
        const { refreshToken } = data;

        const storedToken = await this.refreshTokenRepo.findByToken(refreshToken);
        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (new Date() > storedToken.expiresAt) {
            await this.refreshTokenRepo.delete(storedToken.id);
            throw new UnauthorizedException('Refresh token expired');
        }

        const user = await this.usersService.findOne(+storedToken.user.id);
        if (!user || user.status !== userStatus.ACTIVE) {
            throw new UnauthorizedException('Invalid user');
        }

        const payload = { sub: user.id, role: user.role, email: user.email };
        const newAccessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
        });

        const newRefreshToken = uuidv4();
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 7);
        await this.refreshTokenRepo.create(user.id, newRefreshToken, newExpiresAt);
        await this.refreshTokenRepo.delete(storedToken.id);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken, message: 'Token refreshed' };
    }

    async requestPasswordReset(data: RequestPasswordResetDto) {
        if (!data.email) {
            throw new BadRequestException('Email is required for password reset');
        }
        
        if (!Validators.isValidEmail(data.email)) {
            throw new BadRequestException('Invalid email format');
        }

        const user = await this.usersService.findByEmail(data.email);
        if (!user || user.status !== userStatus.ACTIVE) {
            throw new BadRequestException('No active user found with this email');
        }

        await this.auditLogService.log('Password reset requested', user.id, { email: data.email });

        return { message: 'Password reset request successful'  };

    }

    async verifyPasswordReset(data: VerifyPasswordResetDto) {
        if (data.newPassword !== data.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        const checkOtp = await this.otpService.verifyOneTimeCode(+data.pendingId, data.otp);
        if (!checkOtp) {
            throw new BadRequestException('Invalid OTP');
        }

        const contact = await this.otpService.findOneTimeCode(+data.pendingId);
        if (!contact) {
            throw new BadRequestException('Invalid OTP');
        }

        const user = await this.usersService.findByEmail(contact.contactId);
        if (!user || user.status !== userStatus.ACTIVE) {
            throw new BadRequestException('No active user found');
        }

        await this.usersService.updatePasswordByEmail(user.id, contact.contactId, data.newPassword);

        const tokens = await this.refreshTokenRepo.findByUserId(user.id);
        for (const token of tokens) {
            await this.refreshTokenRepo.delete(token.id);
        }

        await this.auditLogService.log('Password reset', user.id, {
            contactId: contact.contactId,
            pendingId: +data.pendingId,
        });

        return { message: 'Password reset successfully' };
    }

    async logout(data: LogoutDto) {
        const { userId } = data;

        const tokens = await this.refreshTokenRepo.findByUserId(userId);
        for (const token of tokens) {
            await this.refreshTokenRepo.delete(token.id);
        }

        await this.auditLogService.log('User logout', userId, {});

        return { message: 'Logout successful' };
    }
}