import { User } from 'src/users/entities/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
} from 'typeorm';

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => User, (user) => user.rooms)
    @JoinTable()
    members: User[];

    @CreateDateColumn()
    createdAt: Date;
}
