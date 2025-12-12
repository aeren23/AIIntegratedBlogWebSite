import { Injectable } from '@nestjs/common';
import { GeminiClient } from './providers/geminiai.provider';

@Injectable()
export class AiService {
  constructor(private readonly aiClient: GeminiClient) {}

  async testConnection(prompt: string) {
    return this.aiClient.test(prompt);
  }
}
