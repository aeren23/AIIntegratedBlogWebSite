// src/ai/ai.provider.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiClient } from './interfaces/ai-client.interface';

@Injectable()
export class OpenAiClient implements AiClient {
  private readonly apiKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('AI_API_KEY');
  }

  async test(prompt: string): Promise<string> {
    // BURASI sadece test için
    // gerçek SDK / fetch çağrısı buraya gelecek
    return `AI responded to: ${prompt}`;
  }
}
