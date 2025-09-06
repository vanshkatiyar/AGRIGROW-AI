import { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreatePostForm } from '@/components/feed/CreatePostForm';
import { EditPostForm } from '@/components/feed/EditPostForm';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, createPost, deletePost, updatePost } from '@/services/postService';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share2, MapPin, Clock, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const Feed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const { data: posts, isLoading, isError } = useQuery({ queryKey: ['posts'], queryFn: getPosts });

  const onSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    toast({ title: message });
  };

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => { onSuccess("Post created successfully!"); setIsCreatePostOpen(false); },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => { onSuccess("Post deleted successfully!"); setDeletingPostId(null); },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => { onSuccess("Post updated successfully!"); setEditingPost(null); },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const handleCreatePost = (formData: FormData) => createPostMutation.mutate(formData);
  const handleDeletePost = () => { if (deletingPostId) deletePostMutation.mutate(deletingPostId); };
  const handleUpdatePost = (content: string) => { if (editingPost) updatePostMutation.mutate({ postId: editingPost._id, content }); };
  const handleLike = (postId: string) => console.log("Like functionality to be implemented with backend.", postId);

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-muted transition-colors"><CardContent className="p-4"><div className="flex items-center gap-3"><Avatar className="h-10 w-10"><AvatarImage src={user?.profileImage} /><AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback></Avatar><div className="flex-1 text-left text-muted-foreground">What's on your mind?</div><Button>Create Post</Button></div></CardContent></Card>
          </DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Create a New Post</DialogTitle></DialogHeader><CreatePostForm onSubmit={handleCreatePost} onClose={() => setIsCreatePostOpen(false)} isPending={createPostMutation.isPending} /></DialogContent>
        </Dialog>

        {isLoading && <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>}
        {isError && <div className="text-center text-red-500">Failed to load posts. Please try again later.</div>}
        
        {posts && posts.map((post: any) => (
          <Card key={post._id}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10"><AvatarImage src={post.author.profileImage} /><AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      {/* --- THIS IS THE CHANGE --- */}
                      <Link to={`/profile/${post.author._id}`} className="font-semibold text-sm hover:underline">{post.author.name}</Link>
                      <Badge variant="secondary" className="text-xs capitalize">{post.author.role || 'Member'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{post.author.location}<span>•</span><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
                  </div>
                </div>
                {user && post.author._id === user.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingPost(post)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingPostId(post._id)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              {post.imageUrl && <div className="rounded-lg overflow-hidden border"><img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover" /></div>}
              <div className="flex items-center justify-between text-muted-foreground pt-2 border-t">
                <button onClick={() => handleLike(post._id)} className="flex items-center gap-2 text-sm hover:text-foreground"><Heart className="h-4 w-4" /> {post.likes.length} Likes</button>
                <button className="flex items-center gap-2 text-sm hover:text-foreground"><MessageSquare className="h-4 w-4" /> {post.comments.length} Comments</button>
                <button className="flex items-center gap-2 text-sm hover:text-foreground"><Share2 className="h-4 w-4" /> Share</button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
            <DialogContent><DialogHeader><DialogTitle>Edit Your Post</DialogTitle></DialogHeader><EditPostForm initialContent={editingPost?.content || ''} onSubmit={handleUpdatePost} onClose={() => setEditingPost(null)} isPending={updatePostMutation.isPending} /></DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingPostId} onOpenChange={() => setDeletingPostId(null)}>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete your post.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deletePostMutation.mutate(deletingPostId!)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Feed;