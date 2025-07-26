import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entites/room.entity';

@Injectable()
export class RoomsRepository {
    constructor(
        @InjectRepository(Room)
        private repo: Repository<Room>,
    ) {}

    async findAll(): Promise<Room[]> {
        return this.repo.find();
    }

    async findById(id: number): Promise<Room | null> {
        return this.repo.findOne({ where: { id }, relations: ['members'] });
    }

    async createRoom(name: string): Promise<Room> {
        const room = this.repo.create({ name, members: [] });
        return this.repo.save(room);
    }

    async save(room: Room): Promise<Room> {
        return this.repo.save(room);
    }
}
