import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from '../entities/refresh-token.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenRepository {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>,
        private readonly configService: ConfigService
    ) {}

    async create(user: number, token: string, expiresAt: Date): Promise<RefreshToken> {
        const saltRounds = parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS', '12'), 10);
        const tokenHash = await bcrypt.hash(token, saltRounds);
        const refreshToken = this.refreshTokenRepo.create({
            tokenHash,
            user: { id: user },
            expiresAt,
        });
        return this.refreshTokenRepo.save(refreshToken);
    }

    async findByUserId(user: number): Promise<RefreshToken[]> {
        return this.refreshTokenRepo.find({
            where: { user: { id: user } },
            relations: ['user'],
        });
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        const tokens = await this.refreshTokenRepo.find({
            relations: ['user'],
        });
        for (const storedToken of tokens) {
            const isMatch = await bcrypt.compare(token, storedToken.tokenHash);
            if (isMatch) {
                return storedToken;
            }
        }
        return null;
    }

    async delete(id: number): Promise<void> {
        await this.refreshTokenRepo.delete(id);
    }
}