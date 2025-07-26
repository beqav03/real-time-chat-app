import { Module } from '@nestjs/common';
import { AuditLogModule } from './audit/audit-log.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('DATABASE_HOST', 'localhost'),
                port: configService.get<number>('DATABASE_PORT', 3306),
                username: configService.get<string>('DATABASE_USERNAME', 'root'),
                password: configService.get<string>('DATABASE_PASSWORD', ''),
                database: configService.get<string>('DATABASE_NAME', 'testbususer'),
                entities: [],
                autoLoadEntities: true,
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                throttlers: [
                    {
                        ttl: configService.get<number>('THROTTLE_TTL', 60),
                        limit: configService.get<number>('THROTTLE_LIMIT', 10),
                    },
                ],
            }),
            inject: [ConfigService],
        }),
        UsersModule,
        AuthModule,
        AuditLogModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
