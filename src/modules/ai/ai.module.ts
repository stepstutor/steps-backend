import { AIService } from '@modules/ai/services/ai.service';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Module({
  providers: [
    AIService,
    {
      provide: OpenAI,
      useFactory: (configService: ConfigService) => {
        return new OpenAI({
          apiKey: configService.get<string>('OPENAI_API_KEY'),
          baseURL: configService.get<string>('OPENAI_API_URL'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AIService],
})
export class AIModule {}
