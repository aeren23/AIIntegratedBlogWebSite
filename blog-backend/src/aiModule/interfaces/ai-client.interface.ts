export interface AiClient {
  test(prompt: string): Promise<string>;
}
