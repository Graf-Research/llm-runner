import { LLMRunner } from "../../base/llm-runner";
import { MultistepTypes } from "../types";
import { MultistepWrapper } from "../wrapper";

export namespace MSModule_YesNo {
  const yes_no_resolver: MultistepTypes.Resolver<boolean> = async (response: string) => response.includes('1');

  export async function ask(llm: LLMRunner.BaseLLM, q: string, session_id?: string): Promise<boolean> {
    const prompt = `Respond 1 if "Yes" or 0 for "No" to this question: ${q}`;
    return await MultistepWrapper.ask(llm, prompt, yes_no_resolver, session_id);
  }

  export async function stream(llm: LLMRunner.BaseLLM, q: string, session_id?: string): Promise<MultistepTypes.StreamResponseWithFinalAnswer<boolean>> {
    const prompt = `Respond 1 if "Yes" or 0 for "No" to this question: ${q}`;
    return await MultistepWrapper.stream(llm, prompt, yes_no_resolver, session_id);
  }
}
