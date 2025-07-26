import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt.guard';
import { AdminGuard } from './guards/admin.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { AuditLogModule } from 'src/audit/audit-log.module';
import { UsersModule } from 'src/users/users.module';
import { UserGuard } from './guards/user.guard';
import { OtpsModule } from 'src/otp/otp.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        ThrottlerModule.forRootAsync({
            useFactory: (configService: ConfigService) => [
                {
                    ttl: configService.get<number>('THROTTLE_TTL', 60),
                    limit: configService.get<number>('THROTTLE_LIMIT', 10),
                },
            ],
            inject: [ConfigService],
        }),
        UsersModule,
        ConfigModule,
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET', 'default_secret'),
                signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') },
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([RefreshToken]),
        AuditLogModule,
        OtpsModule
    ],
    providers: [
        AuthService,
        JwtGuard,
        UserGuard,
        AdminGuard,
        RefreshTokenRepository,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
    controllers: [AuthController],
    exports: [
        AuthService,
        JwtGuard,
        UserGuard,
        AdminGuard,
        JwtModule,
        RefreshTokenRepository
    ],
})
export class AuthModule {}