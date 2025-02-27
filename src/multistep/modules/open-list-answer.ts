import { LLMRunner } from "../../base/llm-runner";
import { MultistepTypes } from "../types";
import { MultistepWrapper } from "../wrapper";

export namespace MSModule_OpenListAnswer {
  const open_list_answer_resolver: MultistepTypes.Resolver<string[]> = async (response: string) => {
    return response.trim().split(/\n+/).map(s => s.trim());
  }
  
  export async function ask(llm: LLMRunner.BaseLLM, q: string, session_id?: string): Promise<string[]> {
    const prompt = `Respond this question: ${q}, give answers as list line by line, remember: one line is one answer.`;
    return await MultistepWrapper.ask(llm, prompt, open_list_answer_resolver, session_id);
  }

  export async function stream(llm: LLMRunner.BaseLLM, q: string, session_id?: string): Promise<MultistepTypes.StreamResponseWithFinalAnswer<string[]>> {
    const prompt = `Respond this question: ${q}, give answers as list line by line, remember: one line is one answer.`;
    return await MultistepWrapper.stream(llm, prompt, open_list_answer_resolver, session_id);
  }
}
