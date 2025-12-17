import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AiService.name);

  private readonly MODEL_TIER_1 = 'gemini-2.5-flash-lite';
  private readonly MODEL_TIER_2 = 'gemini-2.5-flash';
  private readonly MODEL_TIER_3 = 'gemini-2.0-flash';
  private readonly MODEL_TIER_4 = 'gemini-flash';

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async tryGenerate(modelName: string, prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: modelName });

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 10000),
          ),
        ]);

        const text = result.response.text()?.trim();
        if (!text) throw new Error('Empty response');
        return text;
      } catch (error: any) {
        const status = error.status || error.response?.status;
        if (status === 503 && attempts < maxAttempts) {
          await this.sleep(1500);
          continue;
        }
        throw error;
      }
    }

    throw new Error('Max retries exceeded');
  }

  private async generateWithFallback(
    prompt: string,
    fallback: string,
  ): Promise<string> {
    const models = [
      this.MODEL_TIER_1,
      this.MODEL_TIER_2,
      this.MODEL_TIER_3,
      this.MODEL_TIER_4,
    ];

    for (const modelName of models) {
      try {
        const text = await this.tryGenerate(modelName, prompt);

        // Kill analytical or fantasy tone
        if (
          /likely|probably|appears|seems|tapestry|journey|unfold|weave|cosmic/i.test(
            text,
          )
        ) {
          return fallback;
        }

        return text;
      } catch {
        await this.sleep(1000);
      }
    }

    return fallback;
  }


  async generateFragmentInsight(
    content: string,
    type: 'text' | 'image' | 'link' | 'location',
    metadata?: any,
  ): Promise<string> {
    let prompt = '';

    switch (type) {
      case 'text':
        prompt = `
You are ECHO, a personal memory companion.

The user wrote:
"${content}"

Write ONE memorable sentence that reads like a private journal.
Speak with gentle confidence, as if the meaning is already understood.
Use poetic but grounded language.
Do not sound analytical or uncertain.
        `;
        break;

      case 'link':
        prompt = `
You are ECHO, a personal memory companion.

The user saved this link:
"${content}"

Write ONE memorable sentence about what this link represented in the user's day.
Focus on intention, curiosity, or care for doing things properly.
Speak with quiet certainty, not analysis.
Avoid words like "likely", "probably", or "appears".
        `;
        break;

      case 'image':
        prompt = `
You are ECHO, a personal memory companion.

The user saved an image.
Optional context:
"${metadata?.caption || 'No caption provided'}"

Write ONE memorable sentence about why the user chose to keep this image.
Focus on feeling, not description.
Speak with warmth and confidence, as if this moment is already understood.
Avoid uncertainty or visual analysis.
        `;
        break;

      case 'location':
        prompt = `
You are ECHO, a personal memory companion.

The user saved this place:
"${content}"

Write ONE memorable sentence about why this place mattered in that moment.
Focus on presence and meaning, not geography.
Use calm, reflective language with gentle confidence.
        `;
        break;
    }

    return this.generateWithFallback(
      prompt,
      'A quiet moment that felt worth holding onto.',
    );
  }

  async generateDailyMemory(
    fragments: { content: string; type: string }[],
  ): Promise<string> {
    if (!fragments?.length) {
      return 'The day moved gently, without many moments asking to be remembered.';
    }

    const inputs = fragments
      .map((f) => `- (${f.type}) ${f.content}`)
      .join('\n');

    const prompt = `
You are ECHO, a personal memory companion.

These moments were captured across one day:
${inputs}

Write a short daily memory in 2–3 sentences.
Make it feel personal and reflective, like a page from a journal.
No advice. No analysis. No metaphors about journeys or time.
    `;

    return this.generateWithFallback(
      prompt,
      'The day settled quietly, shaped by moments that mattered in simple ways.',
    );
  }
}
