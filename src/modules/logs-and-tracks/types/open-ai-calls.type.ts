import { OpenAiCallsType } from 'src/common/enums/open-ai-calls-type';

export interface CreateOpenAICallsLog {
  userId: string;
  type: OpenAiCallsType;
  patientMasterId?: string;
  clinicalActivityMasterId?: string;
  clinicalActivityPerformId?: string;
}
