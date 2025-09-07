// frontend/src/components/consultations/BookConsultationForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { REAL_CROP_DATA } from "@/utils/realCropData";

const cropOptions = Object.keys(REAL_CROP_DATA);

const formSchema = z.object({
  cropType: z.string({ required_error: "Please select the crop." }),
  issue: z.string().min(10, "Please describe the issue in at least 10 characters."),
  urgency: z.enum(["low", "medium", "high", "critical"]),
});

type FormData = z.infer<typeof formSchema> & { expertId: string };

interface BookConsultationFormProps {
  expertId: string;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
  isPending: boolean;
}

export const BookConsultationForm: React.FC<BookConsultationFormProps> = ({ expertId, onSubmit, onClose, isPending }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { urgency: 'medium' },
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({ ...values, expertId });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField control={form.control} name="cropType" render={({ field }) => (
          <FormItem><FormLabel>Affected Crop</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select a crop" /></SelectTrigger></FormControl><SelectContent>{cropOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="issue" render={({ field }) => (
          <FormItem><FormLabel>Describe the Issue</FormLabel><FormControl><Textarea placeholder="e.g., The leaves on my tomato plants are turning yellow..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="urgency" render={({ field }) => (
          <FormItem><FormLabel>Urgency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select><FormMessage /></FormItem>
        )} />
        
        {/* We can add image uploads here in the future */}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending}>{isPending ? 'Sending...' : 'Send Request'}</Button>
        </div>
      </form>
    </Form>
  );
};