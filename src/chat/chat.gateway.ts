import {
    WebSocketGateway,
    SubscribeMessage,
    OnGatewayInit,
    WebSocketServer,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { UserPayload } from 'src/common/interfaces/user-payload.interface';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { SendMessageDto } from './dtos/send-message.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) {}

    afterInit() {
        this.server.use(async (socket: Socket, next) => {
            try {
                const token = socket.handshake.auth?.token;
                if (!token) {
                    throw new Error('Authorization token is missing');
                }
                const payload = this.jwtService.verify<UserPayload>(token);
                (socket as any).user = {
                    userId: payload.userId,
                    username: payload.username,
                };
                next();
            } catch (err) {
                next(new Error('Unauthorized'));
            }
        });
    }

    @UseGuards(JwtGuard)
    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @MessageBody() data: { roomId: number },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(`room_${data.roomId}`);
    }

    @UseGuards(JwtGuard)
    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(
        @MessageBody() data: { roomId: number },
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(`room_${data.roomId}`);
    }

    @UseGuards(JwtGuard)
    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() sendMessageDto: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        const payload: UserPayload = (client as any).user;
        const message = await this.chatService.sendMessage(
            payload.userId,
            sendMessageDto,
        );
        this.server.to(`room_${message.room.id}`).emit('message', {
            id: message.id,
            content: message.content,
            senderId: message.sender.id,
            senderUsername: message.sender.name,
            roomId: message.room.id,
            timestamp: message.timestamp,
        });
    }
}
