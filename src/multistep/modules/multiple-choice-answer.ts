import { LLMRunner } from "../../base/llm-runner";
import { MultistepTypes } from "../types";
import { MultistepWrapper } from "../wrapper";

export namespace MSModule_MultipleChoiceAnswer {
  function generateMultipleChoiceAnswerResolver(options: string[]): MultistepTypes.Resolver<string[]> {
    return async (response: string) => {
      const list_options_answer = response.trim().split(/[\n,]/).map(s => s.trim());
      const sorted_list_options_answer = [...list_options_answer].sort((a: string, b: string) => b.length - a.length);
      const selected_data: string[] = sorted_list_options_answer.filter(a => options.includes(a));
      return list_options_answer.filter(b => selected_data.includes(b));
    }
  }
  
  export async function ask(llm: LLMRunner.BaseLLM, q: string, options: string[], session_id?: string): Promise<string[]> {
    const prompt = `Respond this question: ${q}, choose one or more from this options as answer: ${options.map(a => `"${a}"`).join(',')}. Put all the answers into one line each. Don't make up an answer, only choose from available options, answer without quote symbol`;
    return await MultistepWrapper.ask(llm, prompt, generateMultipleChoiceAnswerResolver(options), session_id);
  }

  export async function stream(llm: LLMRunner.BaseLLM, q: string, options: string[], session_id?: string): Promise<MultistepTypes.StreamResponseWithFinalAnswer<string[]>> {
    const prompt = `Respond this question: ${q}, choose one or more from this options as answer: ${options.map(a => `"${a}"`).join(',')}. Put all the answers into one line each. Don't make up an answer, only choose from available options, answer without quote symbol`;
    return await MultistepWrapper.stream(llm, prompt, generateMultipleChoiceAnswerResolver(options), session_id);
  }
}
