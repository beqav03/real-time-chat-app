import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { userRoles } from 'src/common/enume/enum';

@Injectable()
export class UserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const role = user?.role;

        if (role !== userRoles.USER) {
            throw new ForbiddenException(
                `Access denied: User role required. Your role: ${role ?? 'undefined'}`
            );
        }
        return true;
    }
}