import { Readable } from 'node:stream';

export namespace GenericLLM {
  export type OnMessage = (chunk: string, is_complete: boolean) => void;

  export interface StreamResponse {
    cancel(): void
    stream(onMessage: OnMessage): Promise<void>
  }

  export abstract class ChatSessionManager<SessionModel, ChatModel> {
    public abstract newSession(): Promise<SessionModel>;
    public abstract getChatSession(id_session: string): Promise<SessionModel>
    public abstract saveMessage(messages: string[], role: string, id_session: string): Promise<void>
    public abstract retrieveHistory(id_session: string): Promise<ChatModel[]>
  }

  export abstract class GenericLLM {
    // chat with stream mode
    public abstract stream(messages: string[], id_session: string): Promise<StreamResponse>;
    public abstract streamNoContext(messages: string[]): Promise<GenericLLM.StreamResponse>;

    // chat without stream
    public abstract ask(messages: string[], id_session: string): Promise<string>;
    public abstract askNoContext(messages: string[]): Promise<string>;
  }

  export abstract class BaseLLM<SessionModel, ChatModel> extends GenericLLM {
    public chat_session_manager: ChatSessionManager<SessionModel, ChatModel>;

    constructor(chat_session_manager: ChatSessionManager<SessionModel, ChatModel>) {
      super();
      this.chat_session_manager = chat_session_manager;
    }

    protected abstract streamChat(messages: string[], id_session: string | null, stream: Readable, ac: AbortController): Promise<void>;
    protected abstract chat(messages: string[], id_session: string | null): Promise<string>;
  }
}
