import { User } from '../entities/user.entity';

export type UserWithInvitationLink = User & { invitationLink?: string };
