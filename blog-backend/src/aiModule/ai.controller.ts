import { Controller, Get, Post, Param, Query, UseGuards, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

interface JwtPayload {
  userId: string;
  roles: string[];
}

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test AI connection' })
  async test(@Query('prompt') prompt: string) {
    return {
      success: true,
      data: await this.aiService.testConnection(prompt ?? 'Hello AI'),
    };
  }

  @Post('summarize/:articleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate AI summary for an article' })
  @ApiResponse({ status: 200, description: 'Summary generated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to manage this article' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async summarizeArticle(
    @Param('articleId') articleId: string,
    @Query('regenerate') regenerate?: string,
    @Req() req?: Request,
  ) {
    const forceRegenerate = regenerate === 'true';
    const user = req?.user as JwtPayload | undefined;
    
    const result = await this.aiService.summarizeArticle(
      articleId,
      forceRegenerate,
      user?.userId,
      user?.roles,
    );
    
    return {
      success: true,
      data: result,
      message: result.isNew ? 'Summary generated successfully' : 'Existing summary returned',
    };
  }

  @Get('summary/:articleId')
  @ApiOperation({ summary: 'Get article summary status' })
  @ApiResponse({ status: 200, description: 'Summary status returned' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getSummaryStatus(@Param('articleId') articleId: string) {
    const result = await this.aiService.getArticleSummaryStatus(articleId);
    
    return {
      success: true,
      data: result,
    };
  }

  @Delete('summary/:articleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear article AI summary' })
  @ApiResponse({ status: 200, description: 'Summary cleared successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to manage this article' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async clearSummary(
    @Param('articleId') articleId: string,
    @Req() req?: Request,
  ) {
    const user = req?.user as JwtPayload | undefined;
    
    await this.aiService.clearArticleSummary(
      articleId,
      user?.userId,
      user?.roles,
    );
    
    return {
      success: true,
      message: 'Summary cleared successfully',
    };
  }
}
