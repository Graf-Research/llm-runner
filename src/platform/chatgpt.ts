import OpenAI from "openai";
import { LLMRunner } from "../base/llm-runner";
import { GenericLLM } from "../base/generic-llm";
import { Message } from "ollama";
import { Readable } from 'node:stream';
import { ChatCompletionMessageParam, ChatModel as ChatGPTModel } from "openai/resources";

/**
 * Chat GPT Implementation
 */
export class ChatGPTLLM extends LLMRunner.BaseLLM {
  private cgpt: OpenAI;
  private model: ChatGPTModel;

  public constructor(api_key: string, model: ChatGPTModel, chat_session_manager?: GenericLLM.ChatSessionManager<LLMRunner.ChatSession, LLMRunner.Message>, baseURL?: string) {
    super(chat_session_manager ?? new LLMRunner.SessionManager());
    this.cgpt = new OpenAI({ apiKey: api_key, baseURL });
    this.model = model;
  }

  protected async streamChat(messages: string[], id_session: string | null, stream: Readable, ac: AbortController): Promise<void> {
    const chat_history = id_session ? await this.chat_session_manager.retrieveHistory(id_session) : [];
    const chat_messages: ChatCompletionMessageParam[] = [
      ...chat_history.map((msg: Message) => ({ role: msg.role, content: msg.content ?? '' }) as ChatCompletionMessageParam),
      ...messages.map(content => ({ role: 'user', content }) as ChatCompletionMessageParam)
    ];

    if (ac.signal.aborted) {
      stream.push(null);
      return;
    }

    const cgpt_stream = await this.cgpt.chat.completions.create({
      model: this.model,
      store: false,
      stream: true,
      n: 1,
      messages: chat_messages
    });

    ac.signal.addEventListener('abort', () => cgpt_stream.controller.abort());
    for await (const chunk of cgpt_stream) {
      const c = chunk satisfies OpenAI.Chat.Completions.ChatCompletionChunk;
      const first_choice = c.choices?.[0] satisfies OpenAI.Chat.Completions.ChatCompletionChunk.Choice;
      const delta = first_choice.delta.content ?? '';
      if (!delta) {
        continue;
      }
      stream.push(delta);
    }
    stream.push(null);
  }

  protected async chat(messages: string[], id_session: string | null): Promise<string> {
    const chat_history = id_session ? await this.chat_session_manager.retrieveHistory(id_session) : [];
    const chat_messages: ChatCompletionMessageParam[] = [
      ...chat_history.map((msg: Message) => ({ role: msg.role, content: msg.content ?? '' }) as ChatCompletionMessageParam),
      ...messages.map(content => ({ role: 'user', content }) as ChatCompletionMessageParam)
    ];

    const res = await this.cgpt.chat.completions.create({
      model: this.model,
      store: false,
      n: 1,
      messages: chat_messages
    });
    
    return res.choices?.[0].message.content ?? '';
  }
}
