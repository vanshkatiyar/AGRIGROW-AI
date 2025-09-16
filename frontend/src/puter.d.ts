declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options: { model: string }) => Promise<string>;
        tts: (text: string, options?: { voice?: string; engine?: string; language?: string }) => Promise<HTMLAudioElement>;
      };
    };
  }
}

export {};