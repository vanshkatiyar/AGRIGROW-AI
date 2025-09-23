import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Volume2, Copy, AlertTriangle, Mic, Send } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { askAIAssistant } from '@/services/aiService';
import { FullScreenLoader } from '@/components/common/FullScreenLoader';
import { AIResponse } from '@/types';

const AIAssistantPage = () => {
  const [query, setQuery] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const mutation = useMutation<AIResponse, Error, string>({ mutationFn: askAIAssistant });

  const handleAsk = () => {
    if (query.trim()) {
      mutation.mutate(query);
    }
  };

  // Check speech synthesis support
  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
    
    // Speech recognition initialization (your existing code)
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
          const finalTranscript = latestResult.transcript;
          setQuery(prev => prev + ' ' + finalTranscript);
          setInterimTranscript('');
        } else {
          setInterimTranscript(latestResult.transcript);
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
  }, []);

  // Text-to-Speech using Web Speech API
  const speakResponse = () => {
    if (mutation.data?.answer && speechSupported) {
      try {
        // Stop any ongoing speech
        stopSpeaking();
        
        const speech = new SpeechSynthesisUtterance();
        speech.text = mutation.data.answer;
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;
        speech.lang = 'en-US';
        
        // Optional: Choose a specific voice
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en') && voice.name.includes('Female')
        );
        if (englishVoice) {
          speech.voice = englishVoice;
        }
        
        speech.onstart = () => setIsSpeaking(true);
        speech.onend = () => setIsSpeaking(false);
        speech.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsSpeaking(false);
        };
        
        synthesisRef.current = speech;
        window.speechSynthesis.speak(speech);
        
      } catch (error) {
        console.error("Error with speech synthesis:", error);
        setIsSpeaking(false);
      }
    } else if (!speechSupported) {
      alert('Text-to-speech is not supported in your browser. Please try Chrome, Edge, or Safari.');
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Load voices when available
  useEffect(() => {
    if (speechSupported) {
      const loadVoices = () => {
        // Voices are loaded asynchronously
      };
      
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, [speechSupported]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
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
          {!speechSupported && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Browser Compatibility</AlertTitle>
              <AlertDescription>
                Text-to-speech works best in Chrome, Edge, or Safari. Some features may be limited in your current browser.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2"
        >
          <Textarea
            value={query + interimTranscript}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Type your question or use the mic..."
            className="flex-grow resize-none"
            rows={1}
          />
          <Button type="button" variant="outline" size="icon" onClick={toggleRecording} title={isRecording ? 'Stop recording' : 'Start recording'}>
            <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Thinking...' : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {mutation.isPending && <FullScreenLoader />}

        {mutation.isSuccess && (
          <Card className="mt-6 animate-in fade-in-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>AI Assistant's Response</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={isSpeaking ? "destructive" : "outline"}
                    size="icon"
                    onClick={isSpeaking ? stopSpeaking : speakResponse}
                    disabled={!speechSupported}
                    title={speechSupported ? 
                      (isSpeaking ? 'Stop speaking' : 'Read aloud') : 
                      'Text-to-speech not supported'}
                  >
                    {isSpeaking ? (
                      <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse"></div>
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {/* Optional: Add a copy button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (mutation.data?.answer) {
                        navigator.clipboard.writeText(mutation.data.answer);
                      }
                    }}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
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