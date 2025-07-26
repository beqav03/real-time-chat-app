import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
    constructor(@InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>) {}

    async log(action: string, userId: number, details?: any) {
        await this.auditRepo.save({
            action,
            userId,
            details: details ? JSON.stringify(details) : undefined,
        });
    }
}