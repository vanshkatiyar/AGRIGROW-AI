import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Send } from "lucide-react";

interface EditPostFormProps {
  initialContent: string;
  onSubmit: (content: string) => void;
  onClose: () => void;
  isPending: boolean;
}

export const EditPostForm: React.FC<EditPostFormProps> = ({ initialContent, onSubmit, onClose, isPending }) => {
  const form = useForm<{ content: string }>({
    defaultValues: { content: initialContent }
  });

  const handleFormSubmit = (values: { content: string }) => {
    if (values.content.trim()) {
      onSubmit(values.content.trim());
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          rules={{ required: "Post content cannot be empty." }}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea className="min-h-[120px] resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending || !form.watch('content')}>
            {isPending ? 'Saving...' : 'Save Changes'} <Send className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </form>
    </Form>
  );
};