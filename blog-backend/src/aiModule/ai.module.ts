// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiPromptService } from './services/ai-prompt.service';
import { OpenAiClient } from './providers/openai.provider';
import { GeminiClient } from './providers/geminiai.provider';
import { Article } from '../articles/entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  controllers: [AiController],
  providers: [AiService, AiPromptService, OpenAiClient, GeminiClient],
  exports: [AiService],
})
export class AiModule {}
