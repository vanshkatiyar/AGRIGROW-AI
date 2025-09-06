import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { askAIAssistant } from '@/services/aiService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIAssistantPage = () => {
  const [query, setQuery] = useState('');

  const mutation = useMutation({
    mutationFn: (newQuery: string) => askAIAssistant(newQuery),
  });

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      mutation.mutate(query);
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
              <Textarea
                placeholder="e.g., What are the best organic fertilizers for tomato plants in a warm climate?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="resize-none"
                rows={4}
              />
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
              <CardTitle>AI Assistant's Response</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{mutation.data.answer}</ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AIAssistantPage;