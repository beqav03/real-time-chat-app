import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

export class CryptoUtils {
    static async hashString(value: string, configService: ConfigService): Promise<string> {
        const saltRounds = parseInt(configService.get<string>('BCRYPT_SALT_ROUNDS', '12'), 10);
        return bcrypt.hash(value, saltRounds);
    }

    static async compareHash(value: string, hash: string): Promise<boolean> {
        return bcrypt.compare(value, hash);
    }

    static generateOtpCode(): string {
        const bytes = crypto.randomBytes(3);
        const num = parseInt(bytes.toString('hex'), 16) % 1000000;
        return num.toString().padStart(6, '0');
    }
}