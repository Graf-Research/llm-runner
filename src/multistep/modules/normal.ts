import { LLMRunner } from "../../base/llm-runner";
import { MultistepTypes } from "../types";
import { MultistepWrapper } from "../wrapper";

export namespace MSModule_Normal {
  const normal_resolver: MultistepTypes.Resolver<string> = async (response: string) => response;
  
  export async function ask(llm: LLMRunner.BaseLLM, q: string, session_id?: string): Promise<string> {
    return await MultistepWrapper.ask(llm, q, normal_resolver, session_id);
  }

  export async function stream(llm: LLMRunner.BaseLLM, q: string, session_id?: string): Promise<MultistepTypes.StreamResponseWithFinalAnswer<string>> {
    return await MultistepWrapper.stream(llm, q, normal_resolver, session_id);
  }
}
