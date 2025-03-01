import { GenericLLM } from "../base/generic-llm";
import { AnthropicLLM } from "../platform/anthropic";
import { ChatGPTLLM } from "../platform/chatgpt";
import { GeminiLLM } from "../platform/gemini";

// Waiting Mode
export async function simple(chat_gpt_api_key: string) {
  const chatgpt = new ChatGPTLLM(chat_gpt_api_key, 'gpt-4o-mini');

  const response: string = await chatgpt.askNoContext(['Apa ibukota Indonesia?']);
  console.log(response);
}

// Stream Mode
export async function simple_stream(chat_gpt_api_key: string) {
  const chatgpt = new ChatGPTLLM(chat_gpt_api_key, 'gpt-4o-mini');

  const response: GenericLLM.StreamResponse = await chatgpt.streamNoContext(['Jelaskan proses metamorfosis pada kupu-kupu']);
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
export async function simple_stream2(anthropic_api_key: string) {
  const chatgpt = new AnthropicLLM(anthropic_api_key, 'claude-3-opus-latest');

  const response: GenericLLM.StreamResponse = await chatgpt.streamNoContext(['Jelaskan proses metamorfosis pada kupu-kupu']);
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
export async function simple_stream3(gemini_api_key: string) {
  const chatgpt = new GeminiLLM(gemini_api_key, 'gemini-1.5-flash');

  const response: GenericLLM.StreamResponse = await chatgpt.streamNoContext(['Jelaskan proses metamorfosis pada kupu-kupu']);
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
