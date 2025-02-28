import { LLMRunner } from "../../base/llm-runner";
import { MultistepTypes } from "../types";
import { MultistepWrapper } from "../wrapper";

export namespace MSModule_Choose {
  function generateChooseResolver(options: string[]): MultistepTypes.Resolver<string> {
    return async (response: string) => {
      const selected = options.sort((a: string, b: string) => b.length - a.length).find(a => response.includes(a));
      if (!selected) {
        throw new Error(`Unexpected LLM answer: ${response}`);
      }
  
      return selected;
    }
  }
  
  export async function ask(llm: LLMRunner.BaseLLM, q: string, options: string[], session_id?: string): Promise<string> {
    const prompt = `Respond this question: ${q}, choose the closest answer from: ${options.map(a => `"${a}"`).join(',')}. Answer with only one option, even when multiple answer is available, answer without quote symbol`;
    return await MultistepWrapper.ask(llm, prompt, generateChooseResolver(options), session_id);
  }

  export async function stream(llm: LLMRunner.BaseLLM, q: string, options: string[], session_id?: string): Promise<MultistepTypes.StreamResponseWithFinalAnswer<string>> {
    const prompt = `Respond this question: ${q}, choose the closest answer from: ${options.map(a => `"${a}"`).join(',')}. Answer with only one option, even when multiple answer is available, answer without quote symbol`;
    return await MultistepWrapper.stream(llm, prompt, generateChooseResolver(options), session_id);
  }
}
