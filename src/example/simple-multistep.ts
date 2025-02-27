import { ChatGPTLLM } from "../platform/chatgpt";
import { MSModule_Choose } from '../multistep/modules/choose';
import { MSModule_OpenListAnswer } from '../multistep/modules/open-list-answer';

// Waiting Mode
export async function simpleMultistep(chat_gpt_api_key: string) {
  const chatgpt = new ChatGPTLLM(chat_gpt_api_key);

  const q1 = 'Saya sedang berada di tempat banyak orang mengantri untuk menyimpan uang';
  const q1_options = ['Bank BCA', 'Istana Negara', 'POM Bensin'];

  const q2 = 'Saya ingin belajar LLM';

  console.log(`<q1 "${q1}">`);
  process.stdout.write('>> ');

  // a1 berisi jawaban dari pilihan q1_options yang paling mendekati
  const a1: string = await MSModule_Choose.ask(chatgpt, q1, q1_options);
  console.log(a1);
  console.log('<q1 selesai>');
  console.log('\n');

  if (a1 === 'Bank BCA') {
    console.log(`<q2 "${q2}">`);
    process.stdout.write('>> ');

    // a2 berisi daftar jawaban dari instruksi q2
    const a2: string[] = await MSModule_OpenListAnswer.ask(chatgpt, q2);
    console.log(a2.join('\n'));
    console.log('<q2 selesai>');
  } else {
    console.log(`<salah>`);
  }

  console.log('\n');
  console.log('<finish>');
}
