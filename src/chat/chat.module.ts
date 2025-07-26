import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatRepository } from './chat.repository';
import { JwtModule } from '@nestjs/jwt';
import { RoomsModule } from 'src/rooms/rooms.module';
import { ChatMessage } from './entities/chat.entity';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ChatMessage]),
        JwtModule.register({}),
        RoomsModule,
        UsersModule
    ],
    controllers: [ChatController],
    providers: [
        ChatService,
        ChatGateway,
        ChatRepository,
        JwtStrategy,
        JwtGuard,
    ],
    exports: [ChatService],
})
export class ChatModule {}
