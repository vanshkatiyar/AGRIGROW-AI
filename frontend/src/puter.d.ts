// frontend/src/puter.d.ts

interface PuterAI {
  chat(prompt: string, image?: File | string, options?: { model?: string; stream?: boolean }): Promise<any>;
  txt2speech(text: string): Promise<HTMLAudioElement>;
}

interface Puter {
  ai: PuterAI;
  print: (...args: any[]) => void;
}

declare global {
  interface Window {
    puter: Puter;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export {};