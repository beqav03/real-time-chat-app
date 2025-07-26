import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { AuditLogModule } from 'src/audit/audit-log.module';
import { OtpsModule } from 'src/otp/otp.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
        TypeOrmModule.forFeature([User]),
        AuditLogModule,
        OtpsModule,
        JwtModule,
    ],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository],
    exports: [UsersService, UsersRepository],
})
export class UsersModule {}