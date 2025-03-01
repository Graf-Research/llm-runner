import { GenericLLM } from "../base/generic-llm";
import { ChatGPTLLM } from "../platform/chatgpt";
import { GeminiLLM } from "../platform/gemini";

// Stream Mode
export async function abortStream(chat_gpt_api_key: string) {
  const chatgpt = new ChatGPTLLM(chat_gpt_api_key, 'gpt-4o-mini');
  const ac = new AbortController();

  setTimeout(() => {
    ac.abort();
    console.log(`<<RESPONSE STREAM ABORTED>>`);
  }, 2000);

  const response: GenericLLM.StreamResponse = await chatgpt.streamNoContext(['Jelaskan proses metamorfosis pada kupu-kupu']);
  ac.signal.addEventListener('abort', () => response.cancel());
  await new Promise(resolve => {
    response.stream((chunk: string, is_complete: boolean) => {
      if (!is_complete) {
        process.stdout.write(chunk);
      } else {
        console.log('\n');
        console.log(`<selesai>`);

        // resolve promise
        resolve(null);
      }
    });
  });
}

// Stream Mode
export async function abortStream2(gemini_api_key: string) {
  const gemini = new GeminiLLM(gemini_api_key, 'gemini-1.5-flash');
  const ac = new AbortController();

  setTimeout(() => {
    ac.abort();
    console.log(`<<RESPONSE STREAM ABORTED>>`);
  }, 2000);

  const response: GenericLLM.StreamResponse = await gemini.streamNoContext(['Jelaskan proses metamorfosis pada kupu-kupu']);
  ac.signal.addEventListener('abort', () => response.cancel());
  await new Promise(resolve => {
    response.stream((chunk: string, is_complete: boolean) => {
      if (!is_complete) {
        process.stdout.write(chunk);
      } else {
        console.log('\n');
        console.log(`<selesai>`);

        // resolve promise
        resolve(null);
      }
    });
  });
}
