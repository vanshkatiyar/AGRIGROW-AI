import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, UploadCloud, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  cropName: z.string().min(2, "Crop name is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  unit: z.enum(["kg", "quintal", "tonne"], { required_error: "Unit is required." }),
  qualityGrade: z.enum(["A", "B", "C"], { required_error: "Grade is required." }),
  harvestDate: z.date({ required_error: "Harvest date is required." }),
  image: z.instanceof(File, { message: "Product image is required." }),
});

interface ListCropFormProps {
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
  isPending: boolean;
}

export const ListCropForm: React.FC<ListCropFormProps> = ({ onSubmit, onClose, isPending }) => {
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'harvestDate' && value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, value as string | Blob);
      }
    });
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Form Fields: Crop Name, Price, Quantity, Unit, Grade, Harvest Date, Description, Image Upload */}
        <FormField control={form.control} name="cropName" render={({ field }) => (<FormItem><FormLabel>Crop Name</FormLabel><FormControl><Input placeholder="e.g., Organic Wheat" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" placeholder="2200" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" placeholder="50" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">per kg</SelectItem><SelectItem value="quintal">per quintal</SelectItem><SelectItem value="tonne">per tonne</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="qualityGrade" render={({ field }) => (<FormItem><FormLabel>Quality Grade</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger></FormControl><SelectContent><SelectItem value="A">A (Premium)</SelectItem><SelectItem value="B">B (Good)</SelectItem><SelectItem value="C">C (Average)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="harvestDate" render={({ field }) => (<FormItem><FormLabel>Harvest Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your product..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="image" render={() => (
            <FormItem><FormLabel>Product Image</FormLabel><FormControl>
                {imagePreview ? (<div className="relative"><img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-md" /><Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => { form.setValue('image', undefined as any); setImagePreview(null); }}><XCircle className="h-4 w-4"/></Button></div>)
                : (<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"><div className="flex flex-col items-center justify-center pt-5 pb-6"><UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p><p className="text-xs text-muted-foreground">PNG or JPG</p></div><Input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} /></label>)}
            </FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending}>{isPending ? 'Listing...' : 'List Crop for Sale'}</Button>
        </div>
      </form>
    </Form>
  );
};