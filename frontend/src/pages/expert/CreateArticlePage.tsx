import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createArticle } from '@/services/articleService';
import { FileText } from 'lucide-react';

const CreateArticlePage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createArticle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expertArticles'] });
            toast({ title: "Article Published!", description: "Your article is now live in your Knowledge Base." });
            navigate('/expert-dashboard');
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.response?.data?.message || "Could not publish article.", variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            mutation.mutate({ title, content });
        }
    };

    return (
        <Layout>
            <div className="container mx-auto p-4 sm:p-6 max-w-3xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText /> Write a New Article</CardTitle>
                        <CardDescription>Share your expertise with the community. Your article will appear on your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Article Title</Label>
                                <Input id="title" placeholder="e.g., Best Practices for Wheat Fertilization" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea id="content" placeholder="Write your article here..." value={content} onChange={(e) => setContent(e.target.value)} required className="min-h-[300px]" />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Publishing..." : "Publish Article"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default CreateArticlePage;