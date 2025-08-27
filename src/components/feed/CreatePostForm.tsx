import { useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send, XCircle } from "lucide-react";

interface CreatePostFormProps {
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
  isPending: boolean;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({ onSubmit, onClose, isPending }) => {
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<{ content: string }>({ defaultValues: { content: "" } });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = (values: { content: string }) => {
    const formData = new FormData();
    formData.append('content', values.content.trim());
    if (imageFile) {
      formData.append('image', imageFile);
    }
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10"><AvatarImage src={user?.profileImage} /><AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback></Avatar>
          <FormField
            control={form.control} name="content" rules={{ required: "Post content cannot be empty." }}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea placeholder={`What's on your mind, ${user?.name}?`} className="min-h-[100px] resize-none" {...field} />
                </FormControl><FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {imagePreview && (
          <div className="relative">
            <img src={imagePreview} alt="Selected preview" className="rounded-lg w-full max-h-60 object-cover" />
            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => { setImageFile(null); setImagePreview(null); }}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Paperclip className="h-5 w-5" /><span>Add Image</span></div>
            <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} />
          </label>
          <Button type="submit" disabled={isPending || !form.watch('content')}>
            {isPending ? 'Posting...' : 'Post'} <Send className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </Form>
  );
};