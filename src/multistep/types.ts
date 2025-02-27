import { GenericLLM } from "../base/generic-llm";

export namespace MultistepTypes {
  export type Resolver<T, U = any> = (response: string, data?: U) => Promise<T>;
  export interface StreamResponseWithFinalAnswer<T> {
    cancel(): void
    stream(onMessage: GenericLLM.OnMessage): Promise<T>
  }
}
