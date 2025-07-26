import { Repository } from 'typeorm';
import { OtpCode, IdentifierType } from './entities/otp-code.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OtpRepository {
    constructor(@InjectRepository(OtpCode) private readonly otpRepo: Repository<OtpCode>) {}

    async create(data: { email: string; codeHash: string; expiresAt: Date }): Promise<OtpCode> {
        const newOtp = this.otpRepo.create({
            contactId: data.email,
            type: IdentifierType.EMAIL,
            codeHash: data.codeHash,
            expiresAt: data.expiresAt,
        });

        return this.otpRepo.save(newOtp);
    }

    async findLatestByEmail(email: string): Promise<OtpCode | null> {
        return this.otpRepo.createQueryBuilder('otp_codes')
            .where('otp_codes.contactId = :contactId', { contactId: email })
            .orderBy('otp_codes.id', 'DESC')
            .getOne();
    }

    async findOneTimeCode(pendingId: number): Promise<OtpCode | null> {
        return this.otpRepo.createQueryBuilder('otp_codes')
            .where('otp_codes.id = :id', { id: pendingId })
            .getOne();
    }

    async incrementAttemptCount(id: number): Promise<void> {
        await this.otpRepo.createQueryBuilder()
            .update(OtpCode)
            .set({ attemptCount: () => 'attemptCount + 1' })
            .where('id = :id', { id })
            .execute();
    }

    async markAsUsed(id: number) {
        await this.otpRepo.createQueryBuilder()
            .update(OtpCode)
            .set({ 
                isUsed: true, 
                usedAt: () => 'CURRENT_TIMESTAMP' 
            })
            .where('id = :id', { id })
            .execute();
    }
}