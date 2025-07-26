import { DataSource, Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditLogRepository extends Repository<AuditLog> {
    constructor(private readonly dataSource: DataSource) {
        super(AuditLog, dataSource.createEntityManager());
    }

    async log(action: string, userId: number, details?: any): Promise<void> {
        await this.save({
            action,
            userId,
            details: details ? JSON.stringify(details) : undefined,
        });
    }
}
