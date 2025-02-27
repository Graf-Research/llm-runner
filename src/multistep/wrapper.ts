import { GenericLLM } from "../base/generic-llm";
import { LLMRunner } from "../base/llm-runner";
import { MultistepTypes } from "./types";

export namespace MultistepWrapper {
  export async function ask<T>(llm: LLMRunner.BaseLLM, prompt: string, resolver: MultistepTypes.Resolver<T>, session_id?: string): Promise<T> {
    const res = session_id ? await llm.ask([prompt], session_id) : await llm.askNoContext([prompt]);
    return await resolver(res);
  }

  export async function stream<T>(llm: LLMRunner.BaseLLM, prompt: string, resolver: MultistepTypes.Resolver<T>, session_id?: string): Promise<MultistepTypes.StreamResponseWithFinalAnswer<T>> {
    const res: GenericLLM.StreamResponse = session_id ? await llm.stream([prompt], session_id) : await llm.streamNoContext([prompt]);
    return {
      cancel() {
        res.cancel();
      },
      async stream(onMessage: GenericLLM.OnMessage): Promise<T> {
        return new Promise<T>((resolve, reject) => {
          let complete_message = '';
          res.stream(async (chunk: string, is_complete: boolean) => {
            onMessage(chunk, is_complete);
            if (is_complete) {
              try {
                resolve(await resolver(complete_message));
              } catch (err: any) {
                reject(err);
              }
              return;
            } else {
              complete_message = `${complete_message}${chunk}`;
            }
          });
        })
      },
    };
  }
}
