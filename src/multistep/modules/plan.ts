import { LLMRunner } from "../../base/llm-runner";
import { MultistepTypes } from "../types";
import { MultistepWrapper } from "../wrapper";
import { MSModule_YesNo } from "./yes-no";

export namespace MSModule_Plan {
  const plan_resolver: MultistepTypes.Resolver<string[]> = async (response: string) => response.split('\n').map(a => a.trim()).filter(Boolean);

  export async function ask(llm: LLMRunner.BaseLLM, q: string, session_id?: string): Promise<string[]> {
    const session = await llm.chat_session_manager.newSession();
    const yn = await MSModule_YesNo.ask(llm, [
      `Look at this instruction`,
      q,
      `Is the instruction above can be broken down into numbered step by step plan?`
    ].join('\n'), session_id ?? session.id);
    if (!yn) {
      throw new Error(`Your prompt cant be broken down into numbered step by step plan`);
    }

    const prompt = `Responds previous instruction with numbered step by step plans, where each step must be one line only.`;
    return await MultistepWrapper.ask(llm, prompt, plan_resolver, session_id);
  }

  export async function stream(llm: LLMRunner.BaseLLM, q: string, session_id?: string): Promise<MultistepTypes.StreamResponseWithFinalAnswer<string[]>> {
    const session = await llm.chat_session_manager.newSession();
    const yn = await MSModule_YesNo.ask(llm, [
      `Look at this instruction`,
      q,
      `Is the instruction above can be broken down into numbered step by step plan?`
    ].join('\n'), session_id ?? session.id);
    if (!yn) {
      throw new Error(`Your prompt cant be broken down into numbered step by step plan`);
    }

    const prompt = `Responds previous instruction with numbered step by step plans, where each step must be one line only.`;
    return await MultistepWrapper.stream(llm, prompt, plan_resolver, session_id ?? session.id);
  }
}
