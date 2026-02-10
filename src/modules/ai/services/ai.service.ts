import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionTool } from 'openai/resources';

import { CowriteProblemResponse } from '@modules/problems/dto/create-problem.dto';
import { ConfigService } from '@nestjs/config';
import {
  createCowriteProblemPrompt,
  createCowriteProblemSolutionPrompt,
} from '../constants/prompts';

@Injectable()
export class AIService {
  constructor(
    private readonly openAiClient: OpenAI,
    private readonly configService: ConfigService,
  ) {}

  async cowriteProblem(
    title: string,
    description: string,
    discipline: string,
    statement: string,
  ): Promise<CowriteProblemResponse> {
    const cowritePrompt = createCowriteProblemPrompt(
      title,
      description,
      discipline,
      statement,
    );
    const toolFunction: ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'generate_problem_components',
        description:
          'Generates essential components for a problem based on the input.',
        parameters: {
          type: 'object',
          properties: {
            essentialConcepts: {
              type: 'string',
              description: 'Essential concepts related to the problem.',
            },
            conceptsConnection: {
              type: 'string',
              description: 'Connection between the essential concepts.',
            },
            assumptions: {
              type: 'string',
              description:
                'Assumptions and simplifications needed to solve the problem.',
            },
            commonMistakes: {
              type: 'string',
              description:
                'Common mistakes students might make when solving the problem and feedback to address them.',
            },
            additionalInformation: {
              type: 'string',
              description:
                'Additional information that can help in solving the problem.',
            },
            instructorPlan: {
              type: 'string',
              description:
                'A detailed step-by-step plan to solve the problem as an instructor.',
            },
          },
          required: [
            'essentialConcepts',
            'conceptsConnection',
            'assumptions',
            'commonMistakes',
            'additionalInformation',
            'instructorPlan',
          ],
        },
      },
    };
    const response = await this.openAiClient.chat.completions.create({
      messages: [{ role: 'user', content: cowritePrompt }],
      model: this.configService.getOrThrow<string>('OPENAI_MODEL_NAME'),
      tools: [toolFunction],
      tool_choice: 'required',
    });

    if (!!response?.choices[0]?.message?.tool_calls?.length) {
      const toolCall = response.choices[0].message.tool_calls[0];
      if (toolCall.type === 'function' && toolCall.function.arguments) {
        const toolResponse = JSON.parse(
          toolCall.function.arguments,
        ) as CowriteProblemResponse;
        return toolResponse;
      }
      throw new InternalServerErrorException(
        'Unexpected tool call response from OpenAI',
      );
    }
    throw new InternalServerErrorException('No tool call response from OpenAI');
  }

  async generateSolutionKey(
    title: string,
    description: string,
    discipline: string,
    statement: string,
    assumptions: string,
    commonMistakes: string,
    additionalInformation: string,
    instructorPlan: string,
  ): Promise<string> {
    const cowriteSolutionPrompt = createCowriteProblemSolutionPrompt(
      title,
      description,
      discipline,
      statement,
      assumptions,
      commonMistakes,
      additionalInformation,
      instructorPlan,
    );
    const toolFunction: ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'generate_solution_key',
        description: 'Generates a detailed solution key for a problem.',
        parameters: {
          type: 'object',
          properties: {
            solutionKey: {
              type: 'string',
              description:
                'A detailed solution key for the problem in KatTeX format.',
            },
          },
          required: ['solutionKey'],
        },
      },
    };
    const response = await this.openAiClient.chat.completions.create({
      messages: [{ role: 'user', content: cowriteSolutionPrompt }],
      model: this.configService.getOrThrow<string>('OPENAI_MODEL_NAME'),
      tools: [toolFunction],
      tool_choice: 'required',
    });
    if (!!response?.choices[0]?.message?.tool_calls?.length) {
      const toolCall = response.choices[0].message.tool_calls[0];
      if (toolCall.type === 'function' && toolCall.function.arguments) {
        const toolResponse = JSON.parse(toolCall.function.arguments);
        return toolResponse.solutionKey;
      }
      throw new InternalServerErrorException(
        'Unexpected tool call response from OpenAI for solution key generation',
      );
    }
    throw new InternalServerErrorException(
      'No tool call response from OpenAI for solution key generation',
    );
  }
}
