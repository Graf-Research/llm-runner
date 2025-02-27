import { GenericLLM } from "../base/generic-llm";
import { ChatGPTLLM } from "../platform/chatgpt";

// Waiting Mode
export async function simpleWithContext(chat_gpt_api_key: string) {
  const chatgpt = new ChatGPTLLM(chat_gpt_api_key);

  const session_id: string = 'sample-id';
  
  const response1: string = await chatgpt.ask(['Apa ibukota Indonesia?'], session_id);
  console.log(response1);

  const response2: string = await chatgpt.ask(['Apa yang saya tanyakan sebelumnya?'], session_id);
  console.log(response2);
}

// Stream Mode
export async function simpleWithContext_stream(chat_gpt_api_key: string) {
  const chatgpt = new ChatGPTLLM(chat_gpt_api_key);

  const session_id: string = 'sample-id';
  
  const response1: GenericLLM.StreamResponse = await chatgpt.stream(['Jelaskan proses metamorfosis pada kupu-kupu'], session_id);
  await new Promise(resolve => {
    response1.stream(async (chunk1: string, is_complete1: boolean) => {
      if (!is_complete1) {
        process.stdout.write(chunk1);
      } else {
        console.log('\n');
        console.log(`<response1 selesai>`);
        const response2: GenericLLM.StreamResponse = await chatgpt.stream(['Apa yang saya tanyakan sebelumnya?'], session_id);
        response2.stream(async (chunk2: string, is_complete2: boolean) => {
          if (!is_complete2) {
            process.stdout.write(chunk2);
          } else {
            console.log('\n');
            console.log(`<response2 selesai>`);
            
            // resolve promise
            resolve(null);
          }
        });
      }
    });
  })
}
