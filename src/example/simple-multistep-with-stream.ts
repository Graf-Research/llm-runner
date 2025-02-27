import { Readable } from 'node:stream';
import { ChatGPTLLM } from "../platform/chatgpt";
import { MSModule_Choose } from '../multistep/modules/choose';
import { MSModule_OpenListAnswer } from '../multistep/modules/open-list-answer';
import { MultistepTypes } from '../multistep/types';

// Stream Mode
export async function simpleMultistepWithStream(chat_gpt_api_key: string) {
  const chatgpt = new ChatGPTLLM(chat_gpt_api_key);

  const stream = new Readable({ objectMode: true, read() {} });

  const q1 = 'Saya sedang berada di tempat banyak orang mengantri untuk menyimpan uang';
  const q1_options = ['Bank BCA', 'Istana Negara', 'POM Bensin'];
  const q2 = 'Saya ingin belajar LLM';

  // Stream Supplier
  new Promise(async resolve => {
    stream.push(`<q1 "${q1}">`);
    stream.push('\n');
    stream.push('>> ');
    
    const s1: MultistepTypes.StreamResponseWithFinalAnswer<string> = await MSModule_Choose.stream(chatgpt, q1, q1_options);

    // a1 berisi jawaban dari pilihan q1_options yang paling mendekati
    const a1: string = await s1.stream((chunk: string) => stream.push(chunk));

    stream.push('\n');
    stream.push('<q1 selesai>');
    stream.push('\n');
    stream.push('\n');

    if (a1 === 'Bank BCA') {
      stream.push(`<q2 "${q2}">`);
      stream.push('\n');
      stream.push('>> ');

      const s2: MultistepTypes.StreamResponseWithFinalAnswer<string[]> = await MSModule_OpenListAnswer.stream(chatgpt, q2);

      // a2 berisi daftar jawaban dari instruksi q2
      const a2: string[] = await s2.stream((chunk: string) => stream.push(chunk));

      stream.push('\n');
      stream.push('<q2 selesai>');
      stream.push('\n');

    } else {
      stream.push(`<salah>`);
    }

    // end stream with null
    stream.push(null);

    // resolve promise
    resolve(null);
  });
  
  // Stream Consumer
  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }

  console.log('\n');
  console.log('<finish>');
}
