import { GenericLLM } from "./generic-llm";
import { v4 } from 'uuid';
import { Readable } from 'node:stream';

export namespace LLMRunner {
  export interface Message {
    content: string
    role: string
  }

  export interface ChatSession {
    id: string
    list_message: Message[]
  }

  /**
   * Chat Session Manager Implementation
   */
  export class SessionManager implements GenericLLM.ChatSessionManager<ChatSession, Message> {
    public list_session: ChatSession[] = [];

    public newSession(): ChatSession {
      const session = {
        id: v4(),
        list_message: []
      };
      this.list_session.push(session);

      return session;
    }

    public getSession(id_session: string): ChatSession | undefined {
      return this.list_session.find(s => s.id == id_session);
    }

    public getChatSession(id_session: string): ChatSession {
      const cs = this.list_session.find(s => s.id == id_session);
      if (!cs) {
        throw new Error('Session not found.');
      }
      return cs;
    }

    public saveMessage(messages: string[], role: string, id_session: string): void {
      const cs = this.getChatSession(id_session);
      cs.list_message.push(...messages.map(content => ({
        role,
        content
      })));
    }

    public retrieveHistory(id_session: string): Message[] {
      const cs = this.getChatSession(id_session);
      return cs.list_message
    }
  }

  /**
   * Abstract Base LLM Class
   */
  export abstract class BaseLLM extends GenericLLM.BaseLLM<ChatSession, Message>  {
    public async stream(message_data: string[] | string, id_session: string): Promise<GenericLLM.StreamResponse> {
      const messages: string[] = Array.isArray(message_data) ? message_data : [message_data];
      const ac = new AbortController();
      const stream = new Readable({ objectMode: true, read() {} })
      this.streamChat(messages, id_session, stream, ac);
      
      return {
        stream: async (onMessage: GenericLLM.OnMessage) => {
          let complete_message = ``;
          for await (const chunk of stream) {
            complete_message = `${complete_message}${chunk}`;
            onMessage(chunk, false);
          }
          await this.chat_session_manager.saveMessage(messages, 'user', id_session);
          await this.chat_session_manager.saveMessage([complete_message], 'assistant', id_session);
          onMessage('', true);
        },
        cancel() {
          ac.abort();
        }
      }
    }

    public async streamNoContext(message_data: string[] | string): Promise<GenericLLM.StreamResponse> {
      const messages: string[] = Array.isArray(message_data) ? message_data : [message_data];
      const ac = new AbortController();
      const stream = new Readable({ objectMode: true, read() {} })
      this.streamChat(messages, null, stream, ac);
      
      return {
        stream: async (onMessage: GenericLLM.OnMessage) => {
          let complete_message = ``;
          for await (const chunk of stream) {
            complete_message = `${complete_message}${chunk}`;
            onMessage(chunk, false);
          }
          onMessage('', true);
        },
        cancel() {
          ac.abort();
        }
      }
    }

    public async ask(message_data: string[] | string, id_session: string): Promise<string> {
      const messages: string[] = Array.isArray(message_data) ? message_data : [message_data];
      const res = await this.chat(messages, id_session);

      await this.chat_session_manager.saveMessage(messages, 'user', id_session);
      await this.chat_session_manager.saveMessage([res], 'assistant', id_session);

      return res;
    }

    public async askNoContext(message_data: string[] | string): Promise<string> {
      const messages: string[] = Array.isArray(message_data) ? message_data : [message_data];
      return await this.chat(messages, null);
    }
  }
}
