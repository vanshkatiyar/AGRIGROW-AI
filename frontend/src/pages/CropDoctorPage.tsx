// frontend/src/pages/CropDoctorPage.tsx

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Stethoscope, UploadCloud, XCircle, Leaf, ShieldCheck, AlertTriangle, Sprout, Bug, Mic, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type DiagnosisResult = {
  crop: string;
  disease: string;
  status: 'healthy' | 'diseased';
  confidence: number;
  remedy: {
    cause?: string;
    chemical?: string;
    biological?: string;
    cultural?: string;
  } | null;
};

const ResultCard: React.FC<{ data: DiagnosisResult }> = ({ data }) => {
  const { crop, disease, status, confidence, remedy } = data;
  const isHealthy = status === 'healthy';

  return (
    <Card className="mt-6 animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="text-primary"/> AI Diagnosis Report
        </CardTitle>
        <CardDescription>
          Analysis complete with a confidence of {(confidence * 100).toFixed(1)}%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Detected Crop</p>
            <p className="font-semibold flex items-center gap-1"><Leaf className="h-4 w-4"/> {crop}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Health Status</p>
            <p className={cn("font-semibold flex items-center gap-1", isHealthy ? 'text-green-600' : 'text-red-600')}>
              {isHealthy ? <ShieldCheck className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
              {disease}
            </p>
          </div>
        </div>

        {!isHealthy && remedy && (
          <div>
            <h3 className="font-semibold mb-3">Recommended Actions</h3>
            <div className="space-y-3 text-sm">
              {remedy.cause && <p><span className="font-medium text-muted-foreground">Cause:</span> {remedy.cause}</p>}
              {remedy.chemical && <div className="flex items-start gap-2"><Sprout className="h-4 w-4 mt-0.5 shrink-0 text-primary"/><p><span className="font-semibold">Chemical Remedy:</span> {remedy.chemical}</p></div>}
              {remedy.biological && <div className="flex items-start gap-2"><Bug className="h-4 w-4 mt-0.5 shrink-0 text-green-600"/><p><span className="font-semibold">Biological Control:</span> {remedy.biological}</p></div>}
              {remedy.cultural && <div className="flex items-start gap-2"><Leaf className="h-4 w-4 mt-0.5 shrink-0 text-orange-500"/><p><span className="font-semibold">Cultural Practices:</span> {remedy.cultural}</p></div>}
            </div>
          </div>
        )}
         <p className="text-xs text-muted-foreground pt-4 border-t">
            Disclaimer: This AI diagnosis is for informational purposes only. Always consult a local agricultural expert for critical decisions.
        </p>
      </CardContent>
    </Card>
  );
};

const CropDoctorPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Load Puter.js script dynamically
  useEffect(() => {
    if (typeof window.puter === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => console.log('Puter.js loaded');
      script.onerror = () => setError('Failed to load Puter.js');
      document.head.appendChild(script);
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => setIsListening(true);
      recognitionInstance.onend = () => setIsListening(false);
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setError(`Speech error: ${event.error}`);
      };
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized text:', transcript);
        alert(`I heard: "${transcript}"`);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech Recognition API not supported');
    }
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setAnalysisResult(null);
    setError(null);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Simulate analysis
    setTimeout(() => {
      setAnalysisResult({
        crop: 'Tomato',
        disease: 'Blight',
        status: 'diseased',
        confidence: 0.92,
        remedy: {
          cause: 'Fungal infection',
          chemical: 'Copper-based fungicide',
          biological: 'Bacillus subtilis',
          cultural: 'Rotate crops and improve air circulation'
        }
      });
      setIsLoading(false);
    }, 2000);
  };

  const toggleListening = () => {
    if (!recognition) {
      setError('Speech recognition not available');
      return;
    }
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const speakDiagnosis = () => {
    if (!analysisResult || typeof window.puter === 'undefined') {
      setError('Text-to-speech not ready');
      return;
    }
    
    const text = `Diagnosis: ${analysisResult.crop} with ${analysisResult.disease}. Confidence: ${Math.round(analysisResult.confidence * 100)}%`;
    window.puter.ai.txt2speech(text)
      .then((audio: HTMLAudioElement) => audio.play())
      .catch((err: any) => setError('TTS failed: ' + err.message));
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl p-4 sm:p-6 space-y-6">
        <div className="text-center">
          <Stethoscope className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-3xl font-bold text-foreground mt-2">Crop Doctor AI</h1>
          <p className="text-muted-foreground">Upload a plant leaf image for an AI-powered diagnosis and remedy plan.</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Crop preview" className="rounded-lg w-full max-h-72 object-contain border bg-muted/20" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => { setSelectedFile(null); setImagePreview(null); setAnalysisResult(null); }}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload an image</span></p>
                    <p className="text-xs text-muted-foreground">PNG or JPG</p>
                  </div>
                  <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} />
                </label>
              )}
              <div className="flex gap-2">
                <Button onClick={handleAnalyze} className="flex-1" disabled={!selectedFile || isLoading}>
                  {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Stethoscope className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Analyzing...' : 'Diagnose Crop'}
                </Button>
                <Button variant="outline" size="icon" onClick={toggleListening}>
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && (
          <div className="space-y-4">
            <ResultCard data={analysisResult} />
            <Button className="w-full" onClick={speakDiagnosis}>
              <Volume2 className="mr-2 h-5 w-5" />
              Speak Diagnosis
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CropDoctorPage;