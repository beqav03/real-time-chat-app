import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, JoinTable } from 'typeorm';

export enum IdentifierType {
    EMAIL = 'email',
}

@Entity('otp_codes')
export class OtpCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ select: true })
    contactId: string;

    @Column({ type: 'enum', enum: IdentifierType })
    type: IdentifierType;

    @Column({ select: true })
    codeHash: string;

    @Column({ default: 0 })
    attemptCount: number;

    @Column({ default: false })
    isUsed: boolean;

    @Column({ type: 'timestamp', nullable: true })
    usedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp' })
    expiresAt: Date;
}