import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { OtpCode } from './entities/otp-code.entity';
import { OtpService } from './otp.service';
import { OtpRepository } from './otp.repository';
import { OtpController } from './otp.controller';

@Module({
    imports: [TypeOrmModule.forFeature([OtpCode]), ConfigModule],
    controllers: [OtpController],
    providers: [
        {
            provide: 'EMAIL_TRANSPORTER',
            useFactory: (configService: ConfigService) => {
                const emailProvider = configService.get<string>(
                    'EMAIL_SERVICE_PROVIDER',
                );
                const apiKey = configService.get<string>('EMAIL_API_KEY');

                if (!emailProvider || !apiKey) {
                    throw new Error('Email service credentials not configured');
                }

                if (emailProvider.toLowerCase() === 'sendgrid') {
                    return createTransport({
                        service: 'SendGrid',
                        auth: {
                            user: 'apikey',
                            pass: apiKey,
                        },
                    });
                }

                throw new Error('Unsupported email provider');
            },
            inject: [ConfigService],
        },
        OtpService,
        OtpRepository,
    ],
    exports: [OtpService, OtpRepository],
})
export class OtpsModule {}
