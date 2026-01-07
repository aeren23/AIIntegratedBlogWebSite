import { Injectable } from '@nestjs/common';

export type PromptType = 'summarize' | 'suggest-tags' | 'moderate-comment' | 'generate-meta';

interface PromptConfig {
  systemPrompt: string;
  maxOutputLength?: number;
}

@Injectable()
export class AiPromptService {
  private readonly prompts: Record<PromptType, PromptConfig> = {
    summarize: {
      systemPrompt: `Sen profesyonel bir içerik editörüsün. Sana verilen blog makalesini özetlemen gerekiyor.

KURALLAR:
1. Özet Türkçe olmalı (makale hangi dilde olursa olsun)
2. Özet 2-3 cümle ile sınırlı olmalı (maksimum 150 kelime)
3. Makalenin ana fikrini ve önemli noktalarını yakala
4. Özet okuyucunun makaleyi okumak isteyip istemediğine karar vermesine yardımcı olmalı
5. HTML etiketlerini temizle, sadece düz metin döndür
6. Abartılı veya clickbait tarzı ifadeler kullanma
7. Objektif ve bilgilendirici ol

ÇIKTI FORMATI:
Sadece özet metnini döndür, başka bir şey ekleme.`,
      maxOutputLength: 500,
    },
    'suggest-tags': {
      systemPrompt: `Sen bir SEO ve içerik uzmanısın. Sana verilen blog makalesine uygun etiketler önermelisin.

KURALLAR:
1. En fazla 5 etiket öner
2. Etiketler İngilizce olmalı
3. Her etiket tek kelime veya kısa bir ifade olmalı (maksimum 2-3 kelime)
4. Etiketler makalenin ana konularını yansıtmalı
5. Genel ve spesifik etiketlerin karışımı olmalı

ÇIKTI FORMATI:
Etiketleri virgülle ayırarak tek satırda döndür. Örnek: javascript, react, web development`,
      maxOutputLength: 200,
    },
    'moderate-comment': {
      systemPrompt: `Sen bir içerik moderatörüsün. Sana verilen yorumu analiz etmelisin.

KURALLAR:
1. Yorumun spam, hakaret, nefret söylemi veya uygunsuz içerik içerip içermediğini belirle
2. 0-100 arası bir güvenlik skoru ver (100 = tamamen güvenli)
3. Eğer skor 50'nin altındaysa, nedenini açıkla

ÇIKTI FORMATI:
JSON formatında döndür: {"score": 85, "reason": null} veya {"score": 25, "reason": "Hakaret içeriyor"}`,
      maxOutputLength: 200,
    },
    'generate-meta': {
      systemPrompt: `Sen bir SEO uzmanısın. Sana verilen blog makalesi için SEO-optimize edilmiş meta description yazmalısın.

KURALLAR:
1. Meta description 150-160 karakter arasında olmalı
2. Makalenin ana konusunu özetlemeli
3. Okuyucuyu tıklamaya teşvik etmeli (ama clickbait olmamalı)
4. Anahtar kelimeleri doğal şekilde içermeli

ÇIKTI FORMATI:
Sadece meta description metnini döndür.`,
      maxOutputLength: 200,
    },
  };

  /**
   * Belirtilen prompt türü için tam prompt oluşturur
   */
  buildPrompt(type: PromptType, content: string, additionalContext?: string): string {
    const config = this.prompts[type];
    
    let fullPrompt = `${config.systemPrompt}\n\n`;
    
    if (additionalContext) {
      fullPrompt += `EK BAĞLAM:\n${additionalContext}\n\n`;
    }
    
    fullPrompt += `İÇERİK:\n${content}`;
    
    return fullPrompt;
  }

  /**
   * HTML içeriği temizler (basit versiyon)
   */
  stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')  // HTML etiketlerini kaldır
      .replace(/&nbsp;/g, ' ')   // HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')      // Birden fazla boşluğu teke indir
      .trim();
  }

  /**
   * Prompt konfigürasyonunu döndürür
   */
  getConfig(type: PromptType): PromptConfig {
    return this.prompts[type];
  }
}
