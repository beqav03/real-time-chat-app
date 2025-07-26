import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';
import { UsersService } from '../users/users.service';
import { CreateRoomDto } from './dtos/create-room.dto';
import { JoinRoomDto } from './dtos/join-room.dto';
import { LeaveRoomDto } from './dtos/leave-room.dto';

@Injectable()
export class RoomsService {
    constructor(
        private roomsRepository: RoomsRepository,
        private usersService: UsersService,
    ) {}

    async createRoom(dto: CreateRoomDto) {
        return this.roomsRepository.createRoom(dto.name);
    }

    async findAll() {
        return this.roomsRepository.findAll();
    }

    async findById(id: number) {
        const room = await this.roomsRepository.findById(id);
        if (!room) {
            throw new NotFoundException('Room not found');
        }
        return room;
    }

    async joinRoom(userId: number, dto: JoinRoomDto) {
        const room = await this.findById(dto.roomId);
        const user = await this.usersService.findOne(userId);
        if (room.members.find((m) => m.id === user.id)) {
            throw new BadRequestException('User already in room');
        }
        room.members.push(user);
        await this.roomsRepository.save(room);
        return room;
    }

    async leaveRoom(userId: number, dto: LeaveRoomDto) {
        const room = await this.findById(dto.roomId);
        room.members = room.members.filter((user) => user.id !== userId);
        await this.roomsRepository.save(room);
        return room;
    }
}
