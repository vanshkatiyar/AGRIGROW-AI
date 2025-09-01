import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { analyzeCropImage } from '@/services/diagnosticsService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, XCircle, AlertTriangle, Bug, Stethoscope } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Make sure you have `react-markdown` installed

const PestDiseasePage = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const mutation = useMutation({
        mutationFn: (formData: FormData) => analyzeCropImage(formData),
    });

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            mutation.reset(); // Reset previous results when a new image is selected
        }
    };
    
    const handleAnalyze = () => {
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            mutation.mutate(formData);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto max-w-3xl p-4 sm:p-6 space-y-6">
                <div className="text-center">
                    <Stethoscope className="h-12 w-12 mx-auto text-primary" />
                    <h1 className="text-3xl font-bold text-foreground mt-2">AI Crop Diagnosis</h1>
                    <p className="text-muted-foreground">Upload an image of a crop leaf for an AI-powered analysis.</p>
                </div>

                <Card>
                    <CardContent className="p-4">
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="Preview" className="w-full h-64 object-contain rounded-md" />
                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => { setImageFile(null); setImagePreview(null); mutation.reset(); }}>
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, or JPEG</p>
                                </div>
                                <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} />
                            </label>
                        )}
                    </CardContent>
                </Card>

                {imageFile && (
                    <Button onClick={handleAnalyze} className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4"/> : <Bug className="mr-2 h-4 w-4" />}
                        {mutation.isPending ? 'Analyzing...' : 'Analyze Crop Image'}
                    </Button>
                )}

                {mutation.isError && (
                    <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Analysis Failed</AlertTitle><AlertDescription>{mutation.error.message}</AlertDescription></Alert>
                )}

                {mutation.isSuccess && (
                    <Card className="animate-in fade-in-50">
                        <CardHeader><CardTitle>AI Diagnosis Results</CardTitle><CardDescription>Powered by Perplexity AI</CardDescription></CardHeader>
                        <CardContent className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-h3:text-lg">
                            {/* The ReactMarkdown component will render the AI's formatted response */}
                            <ReactMarkdown>{mutation.data.answer}</ReactMarkdown>
                            <p className="text-xs text-muted-foreground mt-4">Disclaimer: This AI diagnosis is for informational purposes only. Always consult a local agricultural expert for critical decisions.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default PestDiseasePage;