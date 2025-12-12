// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenAiClient } from './providers/openai.provider';
import { GeminiClient } from './providers/geminiai.provider';

@Module({
  controllers: [AiController],
  providers: [AiService, OpenAiClient, GeminiClient],
  exports: [AiService],
})
export class AiModule {}
