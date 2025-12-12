import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai'; // Yeni import
import { AiClient } from '../interfaces/ai-client.interface'; // Varsayılan interface'iniz

@Injectable()
export class GeminiClient implements AiClient {
  // private readonly ai: GoogleGenAI; // Eğer SDK'yı constructor'da başlatmak isterseniz
  private readonly ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    // 1. ConfigService'den API Anahtarını al
    const apiKey = this.configService.get<string>('GEMINI_API_KEY'); // Anahtar adını güncelledik

    if (!apiKey) {
      // Anahtar yoksa uygulamayı başlatmadan hata fırlatmak güvenlik için önemlidir.
      throw new InternalServerErrorException(
        'GEMINI_API_KEY ortam değişkeni ConfigService içinde ayarlanmamış.',
      );
    }

    // 2. GoogleGenAI örneğini anahtar ile başlat
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Gemini API'yi kullanarak içerik oluşturma metodu.
   * @param prompt AI'ya gönderilecek metin girdisi
   * @returns AI'dan gelen yanıt metni
   */
  async generateContent(prompt: string): Promise<string | undefined> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash', // Hızlı ve genel görevler için ideal model
        contents: prompt, // Kullanıcının girdisi
      })

      // Oluşturulan metin parçasını döndürür
      return response.text;
    } catch (error) {
      console.error('Gemini API çağrısı başarısız oldu:', error);
      // Hata fırlatarak Controller'ın bu hatayı yakalamasını sağlayın
      throw new InternalServerErrorException('AI servisinde içerik oluşturma hatası.');
    }
  }

  // Eğer `test` metodunuzu kullanmak isterseniz
  async test(prompt: string): Promise<string | undefined> {
    return this.generateContent(prompt);
  }
}