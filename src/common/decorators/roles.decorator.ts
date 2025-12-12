import { Reflector } from '@nestjs/core';
import { Role } from '../enums/userRole';

export const Roles = Reflector.createDecorator<Role[]>();
