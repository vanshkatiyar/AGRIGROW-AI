import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { askAIAssistant, textToSpeech } from '@/services/aiService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, AlertTriangle, Mic, Volume2, Languages, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Indian languages with preferred voice mappings
const SUPPORTED_LANGUAGES = [
  { 
    code: 'en', 
    name: 'English', 
    voiceCode: 'en-IN',
    preferredVoices: ['Microsoft David Desktop', 'Google US English', 'English (India)']
  },
  { 
    code: 'hi', 
    name: 'Hindi', 
    voiceCode: 'hi-IN',
    preferredVoices: ['Microsoft Komal Desktop', 'Google हिन्दी', 'Hindi (India)'],
    problemChars: [':', ';', '@', '#', '$', '%'] // Characters that cause issues with some voices
  },
  { 
    code: 'ta', 
    name: 'Tamil', 
    voiceCode: 'ta-IN',
    preferredVoices: ['Microsoft Valluvar Desktop', 'Google தமிழ்', 'Tamil (India)']
  },
  { 
    code: 'te', 
    name: 'Telugu', 
    voiceCode: 'te-IN',
    preferredVoices: ['Microsoft Chitra Desktop', 'Google తెలుగు', 'Telugu (India)']
  },
  { 
    code: 'kn', 
    name: 'Kannada', 
    voiceCode: 'kn-IN',
    preferredVoices: ['Microsoft Gagan Desktop', 'Google ಕನ್ನಡ', 'Kannada (India)']
  },
  { 
    code: 'ml', 
    name: 'Malayalam', 
    voiceCode: 'ml-IN',
    preferredVoices: ['Microsoft Malayalam Desktop', 'Google മലയാളം', 'Malayalam (India)']
  },
  { 
    code: 'bn', 
    name: 'Bengali', 
    voiceCode: 'bn-IN',
    preferredVoices: ['Microsoft Bengali Desktop', 'Google বাংলা', 'Bengali (India)']
  },
  { 
    code: 'mr', 
    name: 'Marathi', 
    voiceCode: 'mr-IN',
    preferredVoices: ['Microsoft Marathi Desktop', 'Google मराठी', 'Marathi (India)']
  },
  { 
    code: 'gu', 
    name: 'Gujarati', 
    voiceCode: 'gu-IN',
    preferredVoices: ['Microsoft Gujarati Desktop', 'Google ગુજરાતી', 'Gujarati (India)']
  },
  { 
    code: 'pa', 
    name: 'Punjabi', 
    voiceCode: 'pa-IN',
    preferredVoices: ['Microsoft Punjabi Desktop', 'Google ਪੰਜਾਬੀ', 'Punjabi (India)']
  }
];

// Clean text for problematic voices (remove/replace problematic characters)
const cleanTextForSpeech = (text: string, languageCode: string): string => {
  const langConfig = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
  
  if (!langConfig?.problemChars || !text) return text;
  
  let cleanedText = text;
  
  // Replace problematic characters with spaces or remove them
  langConfig.problemChars.forEach(char => {
    cleanedText = cleanedText.replace(new RegExp(`\\${char}`, 'g'), ' ');
  });
  
  // Remove extra spaces and trim
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  
  return cleanedText;
};

// Language detection function
const detectQuestionLanguage = (question: string): string => {
  const trimmedText = question.trim().toLowerCase();
  
  if (trimmedText.length === 0) return 'en';
  
  // Unicode character detection
  if (/[\u0900-\u097F]/.test(question)) return 'hi'; // Hindi
  if (/[\u0B80-\u0BFF]/.test(question)) return 'ta'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(question)) return 'te'; // Telugu
  if (/[\u0C80-\u0CFF]/.test(question)) return 'kn'; // Kannada
  if (/[\u0D00-\u0D7F]/.test(question)) return 'ml'; // Malayalam
  if (/[\u0980-\u09FF]/.test(question)) return 'bn'; // Bengali
  if (/[\u0A80-\u0AFF]/.test(question)) return 'gu'; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(question)) return 'pa'; // Punjabi
  
  // Common words detection
  const hindiWords = ['kya', 'kaise', 'kahan', 'kyon', 'kitna', 'kaun', 'kis', 'hai', 'ho'];
  const tamilWords = ['enna', 'eppadi', 'enga', 'yaaru', 'edharku'];
  const teluguWords = ['emi', 'ela', 'ekkada', 'evaru', 'enduku'];
  
  if (hindiWords.some(word => trimmedText.includes(word))) return 'hi';
  if (tamilWords.some(word => trimmedText.includes(word))) return 'ta';
  if (teluguWords.some(word => trimmedText.includes(word))) return 'te';
  
  return 'en';
};

interface VoiceSettings {
  inputLanguage: string;
  outputLanguage: string;
  voice: SpeechSynthesisVoice | null;
  useFallback: boolean;
}

const AIAssistantPage = () => {
  const [query, setQuery] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    inputLanguage: 'en',
    outputLanguage: 'en',
    voice: null,
    useFallback: false
  });
  const [voiceError, setVoiceError] = useState<string>('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mutation = useMutation({
    mutationFn: (data: { question: string; language: string }) =>
      askAIAssistant(data.question, data.language),
  });

  // Initialize speech synthesis and recognition
  useEffect(() => {
    const synthesisSupported = 'speechSynthesis' in window;
    const recognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    
    setSpeechSupported(synthesisSupported);

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      if (voices.length > 0) {
        const defaultVoice = findBestVoiceForLanguage(voiceSettings.outputLanguage, voices);
        setVoiceSettings(prev => ({
          ...prev,
          voice: defaultVoice
        }));
      }
      
      // Log available voices for debugging
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
    };

    if (synthesisSupported) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }

    // Initialize speech recognition
    if (recognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = getVoiceCodeForLanguage(voiceSettings.inputLanguage);

      recognitionRef.current.onresult = (event) => {
        const results = Array.from(event.results);
        const latestResult = results[results.length - 1];
        
        if (latestResult.isFinal) {
          const finalTranscript = latestResult[0].transcript;
          setQuery(prev => (prev ? prev + ' ' : '') + finalTranscript);
          setInterimTranscript('');
        } else {
          setInterimTranscript(latestResult[0].transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        setInterimTranscript('');
      };
    }

    return () => {
      if (synthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getVoiceCodeForLanguage = (langCode: string): string => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    return lang ? lang.voiceCode : 'en-IN';
  };

  // Enhanced voice selection with fallback options
  const findBestVoiceForLanguage = (languageCode: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    const langConfig = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
    const voiceCode = getVoiceCodeForLanguage(languageCode);
    
    if (!langConfig) return null;

    const langVoices = voices.filter(voice => 
      voice.lang.includes(voiceCode) || 
      voice.lang.replace('_', '-').includes(voiceCode)
    );

    if (langVoices.length === 0) {
      console.warn(`No voices found for language: ${languageCode}`);
      return null;
    }

    // Try preferred voices first
    for (const preferredVoice of langConfig.preferredVoices) {
      const voice = langVoices.find(v => 
        v.name.includes(preferredVoice) || 
        v.name.toLowerCase().includes(preferredVoice.toLowerCase())
      );
      if (voice) {
        console.log(`Using preferred voice: ${voice.name} for ${languageCode}`);
        return voice;
      }
    }

    // Fallback to any available voice for the language
    console.log(`Using fallback voice: ${langVoices[0].name} for ${languageCode}`);
    return langVoices[0];
  };

  const handleInputLanguageChange = (languageCode: string) => {
    setVoiceSettings(prev => ({
      ...prev,
      inputLanguage: languageCode
    }));
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = getVoiceCodeForLanguage(languageCode);
    }
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuery = query + (interimTranscript ? ' ' + interimTranscript : '');
    
    if (finalQuery.trim()) {
      const detectedLanguage = detectQuestionLanguage(finalQuery);
      
      const detectedVoice = findBestVoiceForLanguage(detectedLanguage, availableVoices);
      
      setVoiceSettings(prev => ({
        ...prev,
        outputLanguage: detectedLanguage,
        voice: detectedVoice,
        useFallback: !detectedVoice
      }));

      setVoiceError(detectedVoice ? '' : `No voice available for ${SUPPORTED_LANGUAGES.find(l => l.code === detectedLanguage)?.name}. Text-to-speech will not work.`);

      mutation.mutate({
        question: finalQuery,
        language: detectedLanguage
      });
      
      setQuery('');
      setInterimTranscript('');
    }
  };

  const toggleRecording = () => {
    if (recognitionRef.current) {
      if (!isRecording) {
        setInterimTranscript('');
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    }
  };

const speakResponse = async () => {
  if (mutation.data?.answer) {
    try {
      setIsSpeaking(true);
      const audio = await textToSpeech(mutation.data.answer, voiceSettings.outputLanguage);
      
      // Clear previous audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audio.src);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audio.src);
        console.error('Audio playback error');
      };
      
      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsSpeaking(false);
      
      // Fallback to browser TTS if server TTS fails
      if (speechSupported && voiceSettings.voice) {
        fallbackBrowserTTS();
      }
    }
  }
};

// Fallback to browser TTS
const fallbackBrowserTTS = () => {
  if (mutation.data?.answer && speechSupported && voiceSettings.voice) {
    const speech = new SpeechSynthesisUtterance(mutation.data.answer);
    speech.lang = getVoiceCodeForLanguage(voiceSettings.outputLanguage);
    speech.voice = voiceSettings.voice;
    
    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => setIsSpeaking(false);
    speech.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(speech);
  }
};

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const currentInputLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === voiceSettings.inputLanguage);
  const currentOutputLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === voiceSettings.outputLanguage);

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 space-y-6">
        <div className="text-center">
          <Languages className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-3xl font-bold text-foreground mt-2">Multilingual Farming Assistant</h1>
          <p className="text-muted-foreground">
            Ask about farming in Indian languages. The assistant will respond in the same language.
          </p>
        </div>

        {/* Language Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Language Settings</CardTitle>
            <CardDescription>
              Select your preferred input language. Voice availability depends on your browser and system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language-select">Input Language</Label>
                <Select value={voiceSettings.inputLanguage} onValueChange={handleInputLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select input language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {voiceSettings.voice && (
                <div className="text-sm text-muted-foreground">
                  Current voice: <strong>{voiceSettings.voice.name}</strong>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voice Availability Warning */}
        {voiceError && (
          <Alert variant="destructive">
            <VolumeX className="h-4 w-4" />
            <AlertTitle>Voice Not Available</AlertTitle>
            <AlertDescription>{voiceError}</AlertDescription>
          </Alert>
        )}

        {/* Query Input Card */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleAsk} className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder={currentInputLanguage ?
                    `Ask your farming question in ${currentInputLanguage.name}...` :
                    "Ask your farming question..."
                  }
                  value={query + (interimTranscript ? (query ? ' ' : '') + interimTranscript : '')}
                  onChange={(e) => setQuery(e.target.value)}
                  readOnly={isRecording}
                  className="resize-none pr-10"
                  rows={4}
                />
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={toggleRecording}
                  disabled={!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {mutation.isPending ? 'Thinking...' : `Ask in ${currentInputLanguage?.name || 'English'}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {mutation.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(mutation.error as Error)?.message || 'An unexpected error occurred. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {mutation.isSuccess && (
          <Card className="mt-6 animate-in fade-in-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>AI Assistant's Response</CardTitle>
                <Button
                  variant={isSpeaking ? "destructive" : "outline"}
                  size="icon"
                  onClick={isSpeaking ? stopSpeaking : speakResponse}
                  disabled={!speechSupported || !voiceSettings.voice}
                  title={
                    !speechSupported ? 'Text-to-speech not supported' :
                    !voiceSettings.voice ? 'No voice available for this language' :
                    isSpeaking ? 'Stop speaking' : `Read aloud in ${currentOutputLanguage?.name}`
                  }
                >
                  {isSpeaking ? (
                    <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse"></div>
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {currentOutputLanguage && (
                <CardDescription>
                  Responding in {currentOutputLanguage.name}
                  {voiceSettings.voice && ` • Voice: ${voiceSettings.voice.name}`}
                  {voiceSettings.outputLanguage === 'hi' && ` • Problematic characters automatically cleaned`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{typeof mutation.data?.answer === 'string' ? mutation.data.answer : ''}</ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AIAssistantPage;