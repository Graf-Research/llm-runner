# Graf LLM Runner

Sebuah alternatif untuk mengutilisasi LLM ke programming NodeJS/Javascript. Didesain fleksibel dan dapat digunakan di berbagai macam LLM hanya dengan API Key atau konfigurasi LLM masing-masing. Library ini mungkin terlihat mirip seperti [LangChain](https://www.langchain.com/) namun dengan fitur yang lebih sederhana.

## Install

```bash
npm install --save @graf-research/llm-runner
```

## Supported LLM

```ts
import { ChatGPTLLM, OllamaLLM, AnthropicLLM, LLMRunner } from "@graf-research/llm-runner";

const chatgpt: LLMRunner.BaseLLM = new ChatGPTLLM('apikey', '<chatgpt model>');
const ollama: LLMRunner.BaseLLM = new OllamaLLM('http://my-ollama-server', '<ollama model>');
const anthropic: LLMRunner.BaseLLM = new AnthropicLLM('apikey', '<anthropic model>');
const gemini: LLMRunner.BaseLLM = new GeminiLLM('apikey', '<gemini model>');

// different platform implementation but same signature BaseLLM class
const llm: LLMRunner.BaseLLM = ollama;
```

## Example

#### Simple

```ts
import { ChatGPTLLM } from "@graf-research/llm-runner";

const chat_gpt_api_key = '<apikey>';
const chatgpt = new ChatGPTLLM(chat_gpt_api_key, 'gpt-4o-mini');
const response: string = await chatgpt.askNoContext(['Apa ibukota Indonesia?']);
```

#### Simple w/ Context

```ts
import { ChatGPTLLM } from "@graf-research/llm-runner";

const chat_gpt_api_key = '<apikey>';
const chatgpt = new ChatGPTLLM(chat_gpt_api_key, 'gpt-4o-mini');
const session = await chatgpt.chat_session_manager.newSession();

const response1: string = await chatgpt.ask(['Apa ibukota Indonesia?'], session.id);
console.log(response1);

const response2: string = await chatgpt.ask(['Apa yang saya tanyakan sebelumnya?'], session.id);
console.log(response2);
```

#### Multistep

```ts
import { ChatGPTLLM, MSModule_Choose, MSModule_OpenListAnswer } from "@graf-research/llm-runner";

const chat_gpt_api_key = '<apikey>';
const chatgpt = new ChatGPTLLM(chat_gpt_api_key, 'gpt-4o-mini');

const q1 = 'Saya sedang berada di tempat banyak orang mengantri untuk menyimpan uang';
const q1_options = ['Bank BCA', 'Istana Negara', 'POM Bensin'];

const q2 = 'Saya ingin belajar LLM';

// a1 berisi jawaban dari pilihan q1_options yang paling mendekati
const a1: string = await MSModule_Choose.ask(chatgpt, q1, q1_options);

if (a1 === 'Bank BCA') {
  // a2 berisi daftar jawaban dari instruksi q2
  const a2: string[] = await MSModule_OpenListAnswer.ask(chatgpt, q2);
}
```

#### Stream

```ts
import { ChatGPTLLM, GenericLLM } from "@graf-research/llm-runner";

const chat_gpt_api_key = '<apikey>';
const chatgpt = new ChatGPTLLM(chat_gpt_api_key, 'gpt-4o-mini');

const response: GenericLLM.StreamResponse = await chatgpt.streamNoContext(['Jelaskan proses metamorfosis pada kupu-kupu']);
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
```

#### Multistep Stream

```ts
import { ChatGPTLLM, MultistepTypes, MSModule_Choose, MSModule_OpenListAnswer } from "@graf-research/llm-runner";

const chatgpt = new ChatGPTLLM(chat_gpt_api_key, 'gpt-4o-mini');
const stream = new Readable({ objectMode: true, read() {} });

const q1 = 'Saya sedang berada di tempat banyak orang mengantri untuk menyimpan uang';
const q1_options = ['Bank BCA', 'Istana Negara', 'POM Bensin'];
const q2 = 'Saya ingin belajar LLM';

// Stream Supplier
new Promise(async resolve => {
  const s1: MultistepTypes.StreamResponseWithFinalAnswer<string> = await MSModule_Choose.stream(chatgpt, q1, q1_options);

  // a1 berisi jawaban dari pilihan q1_options yang paling mendekati
  const a1: string = await s1.stream((chunk: string) => stream.push(chunk));

  if (a1 === 'Bank BCA') {
    const s2: MultistepTypes.StreamResponseWithFinalAnswer<string[]> = await MSModule_OpenListAnswer.stream(chatgpt, q2);

    // a2 berisi daftar jawaban dari instruksi q2
    const a2: string[] = await s2.stream((chunk: string) => stream.push(chunk));
  } else {
    stream.push(`<jawaban salah>`);
  }

  // always end stream with null
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
```

## Features

### ⚡ Multiple LLM Instance Implementation

```ts
import { ChatGPTLLM, OllamaLLM, AnthropicLLM, LLMRunner } from "@graf-research/llm-runner";

const chatgpt: LLMRunner.BaseLLM = new ChatGPTLLM('apikey', 'gpt-4o-mini');
const ollama: LLMRunner.BaseLLM = new OllamaLLM('http://my-ollama-server', 'deepseek-r1:8b');
const anthropic: LLMRunner.BaseLLM = new AnthropicLLM('apikey', 'claude-3-opus-latest');
const gemini: LLMRunner.BaseLLM = new GeminiLLM('apikey', 'gemini-1.5-flash');

// different platform implementation but same signature BaseLLM class
const llm: LLMRunner.BaseLLM = ollama;
```

### ⚡ Simple Instructions (with/without context)

#### 🔥 No Context

*No Stream*

```ts
import { ChatGPTLLM, LLMRunner } from "@graf-research/llm-runner";

const llm: LLMRunner.BaseLLM = new ChatGPTLLM('<apikey>', 'gpt-4o-mini');

// pass string
const response: string = await llm.askNoContext('Apa ibukota Indonesia?');

// pass array of string
const response: string = await llm.askNoContext([
  'Saya sedang berada di Indonesia',
  'apa ibukota negara tersebut?'
]);
```

*With Stream*

```ts
import { ChatGPTLLM, GenericLLM, LLMRunner } from "@graf-research/llm-runner";

const llm: LLMRunner.BaseLLM = new ChatGPTLLM('<apikey>', 'gpt-4o-mini');

// can pass string or array of string
const response: GenericLLM.StreamResponse = await chatgpt.streamNoContext(['Jelaskan proses metamorfosis pada kupu-kupu']);
response.stream((chunk: string, is_complete: boolean) => {
  ...
});
```

#### 🔥 With Context

*No Stream*

```ts
import { ChatGPTLLM, LLMRunner } from "@graf-research/llm-runner";

const llm: LLMRunner.BaseLLM = new ChatGPTLLM('<apikey>', 'gpt-4o-mini');
const session = await llm.chat_session_manager.newSession();
const response1: string = await llm.ask(['Apa ibukota Indonesia?'], session.id);
const response2: string = await llm.ask(['Apa yang saya tanyakan sebelumnya?'], session.id);
// response2 will remember conversation history/context
```

*With Stream*

```ts
import { ChatGPTLLM, LLMRunner } from "@graf-research/llm-runner";

const llm: LLMRunner.BaseLLM = new ChatGPTLLM('<apikey>', 'gpt-4o-mini');
const session = await llm.chat_session_manager.newSession();

const response1: GenericLLM.StreamResponse = await chatgpt.stream(['Jelaskan proses metamorfosis pada kupu-kupu'], session.id);
response1.stream(async (chunk1: string, is_complete1: boolean) => {
  if (is_complete1) {
    const response2: GenericLLM.StreamResponse = await chatgpt.stream(['Apa yang saya tanyakan sebelumnya?'], session.id);
    response2.stream(async (chunk2: string, is_complete2: boolean) => {
      ...
    });
  } else {
    ...
  }
});
```

### ⚡ Multistep

Seluruh modul pada multistep memiliki signature berikut:

```ts
type OnMessage = (chunk: string, is_complete: boolean) => void;

interface StreamResponseWithFinalAnswer<T> {
  cancel(): void
  stream(onMessage: OnMessage): Promise<T>
}

async function ask(...{Params}): Promise<{OutputType}> { ... }
async function stream(...{Params}): Promise<MultistepTypes.StreamResponseWithFinalAnswer<{OutputType}>> { ... }
```

Saat ini baru beberapa fitur multistep yang baru diimplementasikan

#### 🔥 Normal

*Sama seperti chat LLM biasa*

##### Signature

```ts
(llm: LLMRunner.BaseLLM, q: string, session_id?: string) => string
```

##### Example

```ts
import { MSModule_Normal } from "@graf-research/llm-runner";

const q = `Apa ibukota Indonesia?`;
const a: string = await MSModule_Normal.ask(chatgpt, q);
```

#### 🔥 Yes/No

*Instruksi akan dijawab true/false*

##### Signature

```ts
(llm: LLMRunner.BaseLLM, q: string, session_id?: string) => boolean
```

##### Example

```ts
import { MSModule_YesNo } from "@graf-research/llm-runner";

const user_chat = 'berapa sisa tabunganku?';
const q = `Untuk menjawab pertanyaan berikut "${user_chat}" apakah perlu mengakses database tabungan?`;
const a: boolean = await MSModule_YesNo.ask(chatgpt, q);
```

#### 🔥 Choose

*Memilih jawaban yang paling benar/mendekati (hanya satu jawaban)*

##### Signature

```ts
(llm: LLMRunner.BaseLLM, q: string, options: string[], session_id?: string) => string
```

##### Example

```ts
import { MSModule_Choose } from "@graf-research/llm-runner";

const q = 'Saya sedang berada di tempat banyak orang mengantri untuk menyimpan uang';
const q_options = ['Bank BCA', 'Istana Negara', 'POM Bensin'];
const a: string = await MSModule_Choose.ask(chatgpt, q, q_options);
```

#### 🔥 Multiple Choice Answer

*Memilih beberapa jawaban yang paling benar/mendekati*

##### Signature

```ts
(llm: LLMRunner.BaseLLM, q: string, options: string[], session_id?: string) => string[]
```

##### Example

```ts
import { MSModule_MultipleChoiceAnswer } from "@graf-research/llm-runner";

const q = 'Manakah kota yang merupakan ibukota provinsi di Indonesia?';
const q_options = ['Jakarta', 'Bogor', 'Kuningan', 'Cilandak', 'Tanjung Duren', 'Semarang'];
const a: string[] = await MSModule_MultipleChoiceAnswer.ask(chatgpt, q, q_options);
```

#### 🔥 Open List Answer

*Instruksi direspon dengan daftar jawaban bebas dalam array string*

##### Signature

```ts
(llm: LLMRunner.BaseLLM, q: string, session_id?: string) => string[]
```

##### Example

```ts
import { MSModule_OpenListAnswer } from "@graf-research/llm-runner";

const q = 'Saya ingin belajar LLM';
const a: string[] = await MSModule_OpenListAnswer.ask(chatgpt, q);
// akan dijawab dengan tahapan belajar LLM
```

#### 🔥 Plans

*Memberikan plan terkait sebuah instruksi (step by step)*

##### Signature

```ts
(llm: LLMRunner.BaseLLM, q: string, session_id?: string) => string[]
```

##### Example

```ts
import { MSModule_Plan } from "@graf-research/llm-runner";

const user_chat = 'Tampilkan laporan penjualan perusahaan bulan ini';
const database_schema = '';
const q = `Berikan instruksi untuk menjawab permintaan: "${user_chat}" berdasarkan skema basis data berikut: ${database_schema}`;
const a: string[] = await MSModule_Plan.ask(chatgpt, q);
// akan memberikan instruksi cara menampilkan laporan keuangan terkait basis data yang telah ditentukan
```

## Abort Stream

Pada umumnya stream yang terlalu panjang kadang harus diberhentikan karena suatu hal, berikut metode untuk mengentikan stream sebelum respon seluruhnya selesai:

```ts
import { ChatGPTLLM, GenericLLM } from "@graf-research/llm-runner";

const chatgpt = new ChatGPTLLM(chat_gpt_api_key, 'gpt-4o-mini');

// 1. Siapkan Abort Controller
const ac = new AbortController();

// 2. Simulasi menghentikan stream (abort), sekitar dua detik setelah stream dimulai
setTimeout(() => {
  ac.abort();
  console.log(`<<RESPONSE STREAM ABORTED>>`);
}, 2000);

const response: GenericLLM.StreamResponse = await chatgpt.streamNoContext(['Jelaskan proses metamorfosis pada kupu-kupu']);

// 3. Invoke pembatalan stream ketika sinyal abort dikirimkan
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
```

Hasil pada console kurang lebih akan seperti berikut:

```text
Metamorfosis pada kupu-kupu adalah proses perubahan bentuk yang terjadi dalam beberapa tahap dari telur hingga menjadi kupu-kupu dewasa. Proses ini terdiri dari empat tahap utama:

1. **Telur**: Proses ini dimulai ketika kupu-kupu betina meletakkan telur pada daun atau tanaman yang sesuai. Telur ini biasanya kecil dan dapat bervariasi dalam warna dan bentuk tergantung pada spesies.

2. **Larva (Ruang)**: Setelah beberapa<<RESPONSE STREAM ABORTED>>


<selesai>
```

## Ekstensi LLM

Untuk menambahkan implementasi LLM, lakukan *extends* kelas `LLMRunner.BaseLLM`

```ts
export class YourLLM extends LLMRunner.BaseLLM {
  public constructor(...{your-llm-params-here}) {
    super(new LLMRunner.SessionManager());
    // constructor
  }

  protected async streamChat(messages: string[], id_session: string | null, stream: Readable, ac: AbortController): Promise<void> {
    // stream chat
  }

  protected async chat(messages: string[], id_session: string | null): Promise<string> {
    // no stream chat
  }
}
```

Lihat contoh implementasi LLM pada folder `/src/platform`
