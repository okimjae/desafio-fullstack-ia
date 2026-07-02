import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiClient {
  private readonly logger = new Logger(AiClient.name);
  private googleAi: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.googleAi = new GoogleGenAI({ apiKey });
        this.logger.log('Gemini GoogleGenAI Client inicializado com sucesso.');
      } catch (error) {
        this.logger.error('Erro ao inicializar o cliente Gemini:', error);
      }
    } else {
      this.logger.warn(
        'GEMINI_API_KEY não configurada. A API utilizará o Mock Fallback.',
      );
    }
  }

  async generateContent(
    prompt: string,
    fallbackGenerator: () => string,
  ): Promise<string> {
    if (this.googleAi) {
      try {
        const response = await this.googleAi.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response && response.text) {
          return response.text;
        }
        throw new Error('Retorno sem conteúdo de texto da API do Gemini.');
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Falha na chamada da API do Gemini (limite de cota ou erro de rede). Acionando Fallback. Erro: ${errorMessage}`,
        );
        return fallbackGenerator();
      }
    } else {
      this.logger.log(
        'Gemini API indisponível no momento. Acionando Fallback.',
      );
      return fallbackGenerator();
    }
  }
}
