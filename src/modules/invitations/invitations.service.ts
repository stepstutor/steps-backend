// **** Library Imports ****
import {
  Inject,
  forwardRef,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

// **** Internal Imports ****
import { Invitation } from './entities/invitation.entity';
import { UsersService } from '../user/services/users.service';

@Injectable()
export class InvitationsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Invitation)
    private invitationsRepository: Repository<Invitation>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  findAll(where: FindOptionsWhere<Invitation>): Promise<Invitation[]> {
    return this.invitationsRepository.find({ where: where });
  }

  findOne(id: string): Promise<Invitation | null> {
    return this.invitationsRepository.findOne({
      where: { id },
      relations: ['institution'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.invitationsRepository.delete(id);
  }

  async add(invitation: Partial<Invitation>): Promise<Invitation> {
    const obj = this.invitationsRepository.create(invitation);
    return this.invitationsRepository.save(obj);
  }

  async acceptInvitation(
    supabaseUid: string,
    firstName: string,
    lastName: string,
    invitation: Invitation,
  ) {
    return this.dataSource.transaction(async (entityManager) => {
      const user = await this.usersService.findByEmail(invitation.email);
      if (!user) {
        throw new InternalServerErrorException(
          'Unable to create user. Please contact your admin.',
        );
      }
      user.supabaseUid = supabaseUid;
      user.isActive = true;
      user.firstName = firstName;
      user.lastName = lastName;
      await entityManager.save(user, {
        reload: true,
      });
      await this.remove(invitation.id);
      return user;
    });
  }
}
