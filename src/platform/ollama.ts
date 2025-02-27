import { Ollama } from "ollama";
import { LLMRunner } from "../base/llm-runner";
import { GenericLLM } from "../base/generic-llm";
import { Readable } from 'node:stream';

/**
 * Ollama Implementation
 */
export class OllamaLLM extends LLMRunner.BaseLLM {
  private ollama: Ollama;
  private model: string;

  public constructor(host: string, model: string, chat_session_manager?: GenericLLM.ChatSessionManager<LLMRunner.ChatSession, LLMRunner.Message>) {
    super(chat_session_manager ?? new LLMRunner.SessionManager());
    this.ollama = new Ollama({ host });
    this.model = model;
  }

  protected async streamChat(messages: string[], id_session: string | null, stream: Readable, ac: AbortController): Promise<void> {
    const chat_history = id_session ? await this.chat_session_manager.retrieveHistory(id_session) : [];
    const cgpt_stream = await this.ollama.chat({
      model: this.model,
      messages: [
        ...chat_history,
        ...messages.map(content => ({
          role: 'user', content
        }))
      ],
      stream: true
    });

    ac.signal.addEventListener('abort', () => cgpt_stream.abort());
    for await (const chunk of cgpt_stream) {
      stream.push(chunk.message.content ?? '');
    }
    stream.push(null);
  }

  protected async chat(messages: string[], id_session: string | null): Promise<string> {
    const chat_history = id_session ? await this.chat_session_manager.retrieveHistory(id_session) : [];
    const res = await this.ollama.chat({
      model: this.model,
      messages: [
        ...chat_history,
        ...messages.map(content => ({ role: 'user', content }))
      ]
    });
    
    return res.message.content;
  }
}
