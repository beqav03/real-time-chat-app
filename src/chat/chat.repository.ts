import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat.entity';

@Injectable()
export class ChatRepository {
    constructor(
        @InjectRepository(ChatMessage)
        private repo: Repository<ChatMessage>,
    ) {}

    async getMessagesByRoom(roomId: number): Promise<ChatMessage[]> {
        return this.repo.find({
            where: { room: { id: roomId } },
            order: { timestamp: 'ASC' },
            relations: ['sender', 'room'],
        });
    }

    async createMessage(
        content: string,
        senderId: number,
        roomId: number,
    ): Promise<ChatMessage> {
        const message = this.repo.create({
            content,
            sender: { id: senderId } as any,
            room: { id: roomId } as any,
        });
        return this.repo.save(message);
    }
}
