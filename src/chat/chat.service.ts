import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { RoomsService } from 'src/rooms/rooms.service';
import { UsersService } from 'src/users/users.service';
import { SendMessageDto } from './dtos/send-message.dto';
import { ChatMessage } from './entities/chat.entity';

@Injectable()
export class ChatService {
    constructor(
        private chatRepository: ChatRepository,
        private roomsService: RoomsService,
        private usersService: UsersService,
    ) {}

    async sendMessage(
        userId: number,
        dto: SendMessageDto,
    ): Promise<ChatMessage> {
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const room = await this.roomsService.findById(dto.roomId);
        if (!room) {
            throw new NotFoundException('Room not found');
        }
        const message = await this.chatRepository.createMessage(
            dto.content,
            user.id,
            room.id,
        );
        return message;
    }

    async getMessages(roomId: number): Promise<ChatMessage[]> {
        return this.chatRepository.getMessagesByRoom(roomId);
    }
}
