import {
  Body,
  Post,
  Logger,
  Request,
  UseGuards,
  Controller,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Role } from '@common/enums/userRole';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { EmailService } from '@common/services/email.service';
import { SupabaseAuthGuard } from '@common/guards/supabase-auth.guard';

import { InvitationsService } from '../invitations.service';
import { AcceptInvitationDto } from '../dtos/acceptInvitationDto';
import { CreateInvitationDto } from '../dtos/createInvitationDto';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  private readonly logger = new Logger(InvitationsController.name);
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly supabaseClient: SupabaseClient,
    private readonly emailService: EmailService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add an invitation' })
  @Roles([Role.INSTITUTE_ADMIN, Role.SUPER_ADMIN])
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  create(@Request() req, @Body() createInvitationBody: CreateInvitationDto) {
    const { id: authenticatedUserId, institutionId } = req.user;

    return this.invitationsService.add({
      ...createInvitationBody,
      ...(institutionId ? { institutionId } : {}),
      createdBy: authenticatedUserId,
      updatedBy: authenticatedUserId,
    });
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept Invitation' })
  async accept(@Body() signupBody: AcceptInvitationDto) {
    const { firstName, lastName, password } = signupBody;
    const invitation = await this.invitationsService.findOne(
      signupBody.invitationId,
    );

    if (!invitation) {
      throw new BadRequestException();
    }

    if (invitation.expireAt.getTime() < Date.now()) {
      throw new BadRequestException('Invitation expired');
    }

    const { data, error } = await this.supabaseClient.auth.admin.createUser({
      email: invitation.email,
      password: password,
      user_metadata: {
        firstName,
        lastName,
        instituteId: invitation.institutionId,
        role: invitation.role,
      },
      email_confirm: true,
    });

    if (error) {
      this.logger.error('Failed to create user in supabase:', error);
      throw new InternalServerErrorException(
        'Unable to create user. Please contact your admin.',
      );
    }

    const supabaseUid = data.user.id;
    await this.invitationsService.acceptInvitation(
      supabaseUid,
      firstName,
      lastName,
      invitation,
    );

    await this.emailService.sendWelcomeEmail(
      `${firstName} ${lastName}`,
      invitation.email,
      invitation.institution?.language,
    );
    return { success: true };
  }
}
