import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { diagnoseCrop } from '@/services/cropDoctorService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Stethoscope, AlertTriangle, UploadCloud, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const CropDoctorPage = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: diagnoseCrop,
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Clear previous results when a new image is selected
      mutation.reset();
    }
  };
  
  const handleDiagnose = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFile) {
      mutation.mutate(imageFile);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl p-4 sm:p-6 space-y-6">
        <div className="text-center">
          <Stethoscope className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-3xl font-bold text-foreground mt-2">Crop Doctor AI</h1>
          <p className="text-muted-foreground">Upload an image of a plant leaf for a free AI-powered diagnosis.</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleDiagnose} className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Crop preview" className="rounded-lg w-full max-h-72 object-contain border bg-muted/20" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => { setImageFile(null); setImagePreview(null); mutation.reset(); }}>
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
              <Button type="submit" className="w-full" disabled={!imageFile || mutation.isPending}>
                {mutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Stethoscope className="mr-2 h-4 w-4" />}
                {mutation.isPending ? 'Analyzing Image...' : 'Diagnose Crop'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {mutation.isError && (<Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{mutation.error.message}</AlertDescription></Alert>)}
        {mutation.isSuccess && (
          <Card className="mt-6 animate-in fade-in-50">
            <CardHeader><CardTitle>AI Diagnosis Report</CardTitle></CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{mutation.data.answer}</ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CropDoctorPage;