import {
    Controller,
    Get,
    Post,
    Query,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { SendMessageDto } from './dtos/send-message.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @ApiOperation({ summary: 'Get messages in a room' })
    @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
    @UseGuards(JwtGuard)
    @Get('messages')
    @Throttle({ default: { limit: 100, ttl: 60 } })
    async getMessages(@Query('roomId') roomId: number) {
        return this.chatService.getMessages(roomId);
    }

    @ApiOperation({ summary: 'Send a message to a room' })
    @ApiResponse({ status: 201, description: 'Message sent successfully' })
    @UseGuards(JwtGuard)
    @Post('send')
    async sendMessage(@Req() req: any, @Body() sendMessageDto: SendMessageDto) {
        const userId = req.user.userId;
        const message = await this.chatService.sendMessage(
            userId,
            sendMessageDto,
        );
        return message;
    }
}
