import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizePipe implements PipeTransform {
    transform(value: any): any {
        if (!value) return value;

        if (Array.isArray(value)) {
            return value.map(item => this.sanitize(item));
        }

        if (typeof value === 'object' && value !== null) {
            const sanitized = { ...value };
            for (const key of Object.keys(sanitized)) {
                sanitized[key] = this.sanitize(sanitized[key]);
            }

            return sanitized;
        }

        return this.sanitize(value);
    }

    private sanitize(value: any): any {
        if (typeof value === 'string') {
            const sanitized = sanitizeHtml(value, {
                allowedTags: ['p', 'strong', 'em', 'a'],
                allowedAttributes: {
                    'a': ['href'],
                },
            });

            if (sanitized !== value) {
                throw new BadRequestException('Input contains invalid characters');
            }

            return sanitized;
        }

        if (typeof value === 'number') {
            return String(value).replace(/\D/g, '');
        }

        if (typeof value === 'boolean') {
            return value;
        }

        if (value instanceof Date) {
            return value;
        }

        throw new BadRequestException('Invalid data type');
    }
}