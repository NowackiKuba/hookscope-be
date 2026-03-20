import Anthropic from '@anthropic-ai/sdk';
import type { Config } from '@config/config.schema';
import { SCHEMA_GENERATION_PROMPT } from '@endpoint/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiGenerationContext,
  AiServicePort,
} from '@shared/domain/ports/outbound/ai.service.port';

@Injectable()
export class AiService implements AiServicePort {
  private readonly client: Anthropic;

  constructor(private readonly config: ConfigService<Config, true>) {
    this.client = new Anthropic({
      apiKey: this.config.get('ANTHROPIC_API_KEY'),
    });
  }

  async generateToJSON<T>(
    prompt: string,
    context: AiGenerationContext,
  ): Promise<T> {
    const systemPrompt = SCHEMA_GENERATION_PROMPT;

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    const raw = text
      .replace(/^```json\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error(`AI returned non-JSON response: ${raw.slice(0, 300)}`);
    }
  }
}
