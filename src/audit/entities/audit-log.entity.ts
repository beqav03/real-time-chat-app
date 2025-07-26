import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    action: string;

    @Column({ nullable: true })
    userId: number;

    @Column({ nullable: true })
    details: string;

    @CreateDateColumn()
    createdAt: Date;
}
