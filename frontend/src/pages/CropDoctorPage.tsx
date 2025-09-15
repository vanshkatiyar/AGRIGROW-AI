// frontend/src/pages/CropDoctorPage.tsx

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Stethoscope, UploadCloud, XCircle, Leaf, ShieldCheck, AlertTriangle, Sprout, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

// Declare Puter.js types
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, imageUrl: string, options: { model: string }) => Promise<string>;
      };
    };
  }
}

// Define types for AI response
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

// Result Card Component to display the diagnosis
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
  const [puterLoaded, setPuterLoaded] = useState(false);

  // Load Puter.js script dynamically
  useEffect(() => {
    if (typeof window.puter === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => setPuterLoaded(true);
      script.onerror = () => setError('Failed to load Puter.js');
      document.head.appendChild(script);
    } else {
      setPuterLoaded(true);
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

    if (!puterLoaded) {
      setError('AI engine is still loading. Please try again in a moment.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Create a blob URL for the image
      const imageUrl = URL.createObjectURL(selectedFile);
      
      // Use Puter AI to analyze the crop image
      const response = await window.puter.ai.chat(
        `You are an expert agricultural AI. Analyze this crop image and provide details about the crop and any diseases.
        Respond ONLY with valid JSON containing these fields:
        - crop: string (crop name)
        - disease: string (disease name or 'No disease detected' if healthy)
        - status: string (either 'healthy' or 'diseased')
        - confidence: number between 0 and 1
        - remedy: object with optional fields (cause, chemical, biological, cultural) OR null if healthy
        
        Example healthy response:
        {"crop": "Tomato", "disease": "No disease detected", "status": "healthy", "confidence": 0.95, "remedy": null}
        
        Example diseased response:
        {"crop": "Rice", "disease": "Blast", "status": "diseased", "confidence": 0.88, "remedy": {"cause": "Fungus", "chemical": "Apply fungicide X", "biological": "Use Trichoderma", "cultural": "Remove infected plants"}}`,
        imageUrl,
        { model: "gpt-5-nano" }
      );

      // Parse the JSON response
      let result: DiagnosisResult;
      try {
        result = JSON.parse(response);
      } catch (err) {
        throw new Error('Invalid JSON response from AI');
      }
      
      // Validate response structure
      if (!result.crop || !result.disease || !result.status || typeof result.confidence !== 'number') {
        throw new Error('Invalid response structure from AI');
      }
      
      setAnalysisResult(result);
      
      // Clean up the blob URL
      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              <Button onClick={handleAnalyze} className="w-full" disabled={!selectedFile || isLoading}>
                {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Stethoscope className="mr-2 h-4 w-4" />}
                {isLoading ? 'Analyzing Image...' : 'Diagnose Crop'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (<Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>)}
        {analysisResult && <ResultCard data={analysisResult} />}
      </div>
    </Layout>
  );
};

export default CropDoctorPage;