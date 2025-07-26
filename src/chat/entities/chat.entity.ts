import { Room } from 'src/rooms/entites/room.entity';
import { User } from 'src/users/entities/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';

@Entity()
export class ChatMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @ManyToOne(() => User, { eager: true })
    sender: User;

    @ManyToOne(() => Room, { eager: true })
    room: Room;

    @CreateDateColumn()
    timestamp: Date;
}
