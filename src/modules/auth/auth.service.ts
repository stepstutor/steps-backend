import { Injectable } from '@nestjs/common';
import { UsersService } from '../user/services/users.service';
import { Language } from '../../common/enums/language';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(supabaseUid: string): Promise<any> {
    const user = await this.usersService.findBySupabaseUid(supabaseUid);
    if (user) {
      const institution = await user.institution;
      const {
        id,
        firstName,
        lastName,
        email,
        profilePic,
        role,
        institutionId,
        isActive,
        // walkthroughScreens,
      } = user;
      const {
        name: institutionName = '',
        language = Language.EN,
        country = '',
        isActive: isInstituteActive,
        isVoiceCallAllowed,
      } = institution || {};
      return {
        id,
        firstName,
        lastName,
        email,
        profilePic,
        role,
        institutionId,
        institutionName,
        language,
        country,
        isActive,
        isInstituteActive,
        // walkthroughScreens,
        isVoiceCallAllowed,
      };
    }
    return null;
  }
}
