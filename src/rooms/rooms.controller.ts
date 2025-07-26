import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateRoomDto } from './dtos/create-room.dto';
import { JoinRoomDto } from './dtos/join-room.dto';
import { LeaveRoomDto } from './dtos/leave-room.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @ApiOperation({ summary: 'Create a new room' })
    @ApiResponse({ status: 201, description: 'Room created successfully' })
    @UseGuards(JwtGuard)
    @Post()
    @Throttle({ default: { limit: 100, ttl: 60 } })
    async createRoom(@Body() createRoomDto: CreateRoomDto) {
        return this.roomsService.createRoom(createRoomDto);
    }

    @ApiOperation({ summary: 'Get all rooms' })
    @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
    @UseGuards(JwtGuard)
    @Get()
    @Throttle({ default: { limit: 100, ttl: 60 } })
    async listRooms() {
        return this.roomsService.findAll();
    }

    @ApiOperation({ summary: 'Join a room' })
    @ApiResponse({ status: 200, description: 'Room joined successfully' })
    @UseGuards(JwtGuard)
    @Post('join')
    @Throttle({ default: { limit: 100, ttl: 60 } })
    async joinRoom(@Req() req: any, @Body() joinRoomDto: JoinRoomDto) {
        const userId = req.user.userId;
        return this.roomsService.joinRoom(userId, joinRoomDto);
    }

    @ApiOperation({ summary: 'Leave a room' })
    @ApiResponse({ status: 200, description: 'Room left successfully' })
    @UseGuards(JwtGuard)
    @Post('leave')
    @Throttle({ default: { limit: 100, ttl: 60 } })
    async leaveRoom(@Req() req: any, @Body() leaveRoomDto: LeaveRoomDto) {
        const userId = req.user.userId;
        return this.roomsService.leaveRoom(userId, leaveRoomDto);
    }
}
