import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomsRepository } from './rooms.repository';
import { Room } from './entites/room.entity';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([Room]), UsersModule, JwtModule],
    controllers: [RoomsController],
    providers: [RoomsService, RoomsRepository],
    exports: [RoomsService],
})
export class RoomsModule {}
