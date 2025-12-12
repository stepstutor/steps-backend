import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../enums/userRole';

@Injectable()
export class InActiveUserGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (
      user &&
      user.isActive &&
      (user.role === Role.SUPER_ADMIN || user.isInstituteActive)
    ) {
      return true;
    } else {
      throw new UnauthorizedException('User is not active');
    }
  }
}
