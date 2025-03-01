import { GenerateContentResult, GenerateContentStreamResult, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { LLMRunner } from "../base/llm-runner";
import { GenericLLM } from "../base/generic-llm";
import { Readable } from 'node:stream';

export type GeminiModel = 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite'
  | 'gemini-1.5-flash'
  | 'gemini-1.5-flash-8b'
  | 'gemini-1.5-pro';

/**
 * Gemini Implementation
 */
export class GeminiLLM extends LLMRunner.BaseLLM {
  private gemini: GenerativeModel;

  public constructor(apikey: string, model: GeminiModel, chat_session_manager?: GenericLLM.ChatSessionManager<LLMRunner.ChatSession, LLMRunner.Message>, max_tokens: number = 1024) {
    super(chat_session_manager ?? new LLMRunner.SessionManager());
    this.gemini = new GoogleGenerativeAI(apikey).getGenerativeModel({ model });
  }

  protected async streamChat(messages: string[], id_session: string | null, stream: Readable, ac: AbortController): Promise<void> {
    const chat_history = id_session ? await this.chat_session_manager.retrieveHistory(id_session) : [];
    const result: GenerateContentStreamResult = await this.gemini.generateContentStream({
      contents: [
        ...chat_history.map((msg: LLMRunner.Message) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        ...messages.map(content => ({
          role: 'user',
          parts: [{ text: content }]
        }))
      ]
    }, { signal: ac.signal });

    // 
    result.response.catch(() => { });

    try {
      for await (const chunk of result.stream) {
        stream.push(chunk.text());
      }
    } catch (err: any) {
      if (err.name == 'AbortError') {
        // aborted
        return;
      }
      throw err;
    } finally {
      stream.push(null);
    }
  }

  protected async chat(messages: string[], id_session: string | null): Promise<string> {
    const chat_history = id_session ? await this.chat_session_manager.retrieveHistory(id_session) : [];
    const result: GenerateContentResult = await this.gemini.generateContent({
      contents: [
        ...chat_history.map((msg: LLMRunner.Message) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        ...messages.map(content => ({
          role: 'user',
          parts: [{ text: content }]
        }))
      ]
    });

    return result.response.text();
  }
}
