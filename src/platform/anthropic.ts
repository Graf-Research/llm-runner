import Anthropic from '@anthropic-ai/sdk';
import { Model as AnthropicModel } from '@anthropic-ai/sdk/resources';
import { LLMRunner } from "../base/llm-runner";
import { GenericLLM } from "../base/generic-llm";
import { Readable } from 'node:stream';

/**
 * Ollama Implementation
 */
export class AnthropicLLM extends LLMRunner.BaseLLM {
  private anthropic: Anthropic;
  private model: AnthropicModel;
  private max_tokens: number = 1024;

  public constructor(apikey: string, model: AnthropicModel, chat_session_manager?: GenericLLM.ChatSessionManager<LLMRunner.ChatSession, LLMRunner.Message>, max_tokens: number = 1024) {
    super(chat_session_manager ?? new LLMRunner.SessionManager());
    this.anthropic = new Anthropic({ apiKey: apikey });
    this.model = model;
    this.max_tokens = max_tokens;
  }

  protected async streamChat(messages: string[], id_session: string | null, stream: Readable, ac: AbortController): Promise<void> {
    const chat_history = id_session ? await this.chat_session_manager.retrieveHistory(id_session) : [];
    const cgpt_stream = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        ...chat_history.map((msg: LLMRunner.Message) => ({
          role: msg.role as any,
          content: msg.content
        })),
        ...messages.map(content => ({
          role: 'user', content
        }))
      ],
      stream: true
    });

    ac.signal.addEventListener('abort', () => cgpt_stream.controller.abort());
    for await (const chunk of cgpt_stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        stream.push(chunk.delta.text ?? '');
      }
    }
    stream.push(null);
  }

  protected async chat(messages: string[], id_session: string | null): Promise<string> {
    const chat_history = id_session ? await this.chat_session_manager.retrieveHistory(id_session) : [];
    const res = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        ...chat_history.map((msg: LLMRunner.Message) => ({
          role: msg.role as any,
          content: msg.content
        })),
        ...messages.map(content => ({
          role: 'user', content
        }))
      ],
    });

    if (res.content?.[0].type === 'text') {
      return res.content[0].text;
    }
    
    return '';
  }
}
