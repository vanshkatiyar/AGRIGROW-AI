import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { askAIAssistant, textToSpeech } from '@/services/aiService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, AlertTriangle, Mic, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIAssistantPage = () => {
  const [query, setQuery] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mutation = useMutation({
    mutationFn: (newQuery: string) => askAIAssistant(newQuery),
  });

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const results = Array.from(event.results);
        const latestResult = results[results.length - 1];
        
        if (latestResult.isFinal) {
          const finalTranscript = latestResult[0].transcript;
          setQuery(prev => prev + ' ' + finalTranscript);
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
    } else {
      console.warn('Speech Recognition API not supported');
    }
  }, []);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuery = query + (interimTranscript ? ' ' + interimTranscript : '');
    if (finalQuery.trim()) {
      mutation.mutate(finalQuery);
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
        const audio = await textToSpeech(mutation.data.answer);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => setIsSpeaking(false);
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsSpeaking(false);
      }
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl p-4 sm:p-6 space-y-6">
        <div className="text-center">
          <Sparkles className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-3xl font-bold text-foreground mt-2">AI Farming Assistant</h1>
          <p className="text-muted-foreground">
            Ask anything about crops, pests, soil, market trends, and more.
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleAsk} className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="e.g., What are the best organic fertilizers for tomato plants in a warm climate?"
                  value={isRecording ? interimTranscript : query}
                  onChange={(e) => isRecording ? setInterimTranscript(e.target.value) : setQuery(e.target.value)}
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
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {mutation.isPending ? 'Thinking...' : 'Ask the Assistant'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {mutation.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle>
            <AlertDescription>{mutation.error.message}</AlertDescription>
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
                  disabled={!('speechSynthesis' in window)}
                >
                  {isSpeaking ? (
                    <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse"></div>
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
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