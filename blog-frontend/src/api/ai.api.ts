import api, { type ApiResponse, unwrapApiResponse } from './axios';

export type AiSummaryResult = {
  summary: string;
  generatedAt: string;
  isNew: boolean;
};

export type AiSummaryStatus = {
  hasSummary: boolean;
  summary: string | null;
  generatedAt: string | null;
};

/**
 * Makale için AI özeti oluştur
 * @param articleId Makale ID'si
 * @param regenerate Mevcut özeti yeniden oluştur
 */
export const generateArticleSummary = async (
  articleId: string,
  regenerate = false
): Promise<AiSummaryResult> => {
  const { data } = await api.post<ApiResponse<AiSummaryResult>>(
    `/ai/summarize/${articleId}`,
    null,
    { params: { regenerate: regenerate ? 'true' : undefined } }
  );
  return unwrapApiResponse(data);
};

/**
 * Makale özet durumunu kontrol et
 * @param articleId Makale ID'si
 */
export const getArticleSummaryStatus = async (
  articleId: string
): Promise<AiSummaryStatus> => {
  const { data } = await api.get<ApiResponse<AiSummaryStatus>>(
    `/ai/summary/${articleId}`
  );
  return unwrapApiResponse(data);
};

/**
 * Makale özetini sil
 * @param articleId Makale ID'si
 */
export const clearArticleSummary = async (articleId: string): Promise<void> => {
  await api.delete(`/ai/summary/${articleId}`);
};
