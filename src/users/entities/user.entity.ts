import { userRoles, userStatus } from "src/common/enume/enum";
import { Room } from "src/rooms/entites/room.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar'})
    name: string;

    @Column({ type: 'enum', enum: userRoles, nullable: false, default: userRoles.USER })
    role: userRoles;

    @Column({type: 'varchar', length: 100, unique: true})
    email: string;

    @Column({type: 'varchar', select: true})
    password: string;

    @Column({type: 'enum', enum: userStatus,  default: userStatus.ACTIVE})
    status: userStatus;

    @Column({ type: 'varchar', nullable: true })
    photoUrl: string | null;

    @ManyToMany(() => Room, (room) => room.members)
    rooms: Room[];

    @Column({type: 'float', default: 0})
    loginAttempts: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({nullable: true})
    updatedAt: Date | null;

    @DeleteDateColumn({nullable: true})
    deletedAt: Date | null;
}