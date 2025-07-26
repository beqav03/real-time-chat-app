import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtPayload {
    sub: string;
    role?: string;
    email?: string;
    [key: string]: any;
}

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('Authorization token not found');
        }

        let payload: JwtPayload;
        try {
            payload = await this.jwtService.verifyAsync<JwtPayload>(token);
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired authorization token');
        }

        if (!payload?.sub || isNaN(Number(payload.sub))) {
            throw new UnauthorizedException('Invalid token payload');
        }

        request.user = {
            id: Number(payload.sub),
            role: payload.role || 'user',
            email: payload.email ?? '',
            ...payload,
        };

        return true;
    }

    private extractToken(request: Request): string | undefined {
        const authHeader = request.headers.authorization;
        if (authHeader) {
            const [type, token] = authHeader.split(' ');
            if (type === 'Bearer' && token) {
                return token;
            }
        }
        const reqWithCookies = request as Request & { cookies?: { [key: string]: string } };
        if (reqWithCookies.cookies && reqWithCookies.cookies['access_token']) {
            return reqWithCookies.cookies['access_token'];
        }
        return undefined;
    }
}