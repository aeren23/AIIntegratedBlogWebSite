import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeminiClient } from './providers/geminiai.provider';
import { AiPromptService } from './services/ai-prompt.service';
import { Article } from '../articles/entities/article.entity';
import { UserRole } from '../auth/enums/user-role.enum';

@Injectable()
export class AiService {
  constructor(
    private readonly aiClient: GeminiClient,
    private readonly promptService: AiPromptService,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async testConnection(prompt: string) {
    return this.aiClient.test(prompt);
  }

  /**
   * Kullanıcının makale üzerinde işlem yapma yetkisi var mı kontrol et
   */
  private checkArticlePermission(
    article: Article,
    userId: string,
    userRoles: string[],
  ): void {
    const isAdmin = userRoles.includes(UserRole.ADMIN) || userRoles.includes(UserRole.SUPERADMIN);
    const isOwner = article.authorId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You can only manage AI summaries for your own articles');
    }
  }

  /**
   * Makale özetleme
   * @param articleId Özetlenecek makalenin ID'si
   * @param forceRegenerate Mevcut özeti yeniden oluştur
   * @param userId İşlemi yapan kullanıcının ID'si
   * @param userRoles Kullanıcının rolleri
   */
  async summarizeArticle(
    articleId: string,
    forceRegenerate = false,
    userId?: string,
    userRoles?: string[],
  ): Promise<{
    summary: string;
    generatedAt: Date;
    isNew: boolean;
  }> {
    // Makaleyi bul
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Yetki kontrolü (userId ve userRoles gönderildiyse)
    if (userId && userRoles) {
      this.checkArticlePermission(article, userId, userRoles);
    }

    // Eğer özet varsa ve yeniden oluşturma istenmiyorsa mevcut özeti döndür
    if (article.aiSummary && article.aiSummaryGeneratedAt && !forceRegenerate) {
      return {
        summary: article.aiSummary,
        generatedAt: article.aiSummaryGeneratedAt,
        isNew: false,
      };
    }

    // İçerik kontrolü
    if (!article.content || article.content.trim().length < 100) {
      throw new BadRequestException('Article content is too short to summarize');
    }

    // HTML'i temizle
    const cleanContent = this.promptService.stripHtml(article.content);

    // Prompt oluştur
    const prompt = this.promptService.buildPrompt(
      'summarize',
      cleanContent,
      `Makale Başlığı: ${article.title}`,
    );

    // AI'dan özet al
    const summary = await this.aiClient.generateContent(prompt);

    if (!summary) {
      throw new BadRequestException('Failed to generate summary');
    }

    // Özeti kaydet
    const now = new Date();
    await this.articleRepository.update(articleId, {
      aiSummary: summary.trim(),
      aiSummaryGeneratedAt: now,
    });

    return {
      summary: summary.trim(),
      generatedAt: now,
      isNew: true,
    };
  }

  /**
   * Makale özetini sil
   * @param articleId Makalenin ID'si
   * @param userId İşlemi yapan kullanıcının ID'si
   * @param userRoles Kullanıcının rolleri
   */
  async clearArticleSummary(
    articleId: string,
    userId?: string,
    userRoles?: string[],
  ): Promise<void> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Yetki kontrolü (userId ve userRoles gönderildiyse)
    if (userId && userRoles) {
      this.checkArticlePermission(article, userId, userRoles);
    }

    await this.articleRepository.update(articleId, {
      aiSummary: null,
      aiSummaryGeneratedAt: null,
    });
  }

  /**
   * Makale özet durumunu kontrol et
   */
  async getArticleSummaryStatus(articleId: string): Promise<{
    hasSummary: boolean;
    summary: string | null;
    generatedAt: Date | null;
  }> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      select: ['id', 'aiSummary', 'aiSummaryGeneratedAt'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return {
      hasSummary: !!article.aiSummary,
      summary: article.aiSummary,
      generatedAt: article.aiSummaryGeneratedAt,
    };
  }
}
