import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(2, "Title is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
  date: z.date({ required_error: "Date is required." }),
  type: z.enum(["income", "expense"], { required_error: "Type is required." }),
  category: z.string({ required_error: "Category is required." }),
});

// --- FARMER-SPECIFIC CATEGORIES ---
const expenseCategories = ["Seeds", "Fertilizer", "Pesticides", "Labor", "Equipment", "Fuel", "Irrigation", "Other"];
const incomeCategories = ["Crop Sale", "Government Subsidy", "Livestock Sale", "Other"];

interface AddFarmerExpenseFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onClose: () => void;
  isPending: boolean;
}

export const AddFarmerExpenseForm: React.FC<AddFarmerExpenseFormProps> = ({ onSubmit, onClose, isPending }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: 'expense' }
  });
  const transactionType = form.watch('type');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="expense" /></FormControl><FormLabel className="font-normal flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-500" /> Expense</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="income" /></FormControl><FormLabel className="font-normal flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> Income</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Purchase of wheat seeds" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount (₹)</FormLabel><FormControl><Input type="number" placeholder="5000" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>{(transactionType === 'expense' ? expenseCategories : incomeCategories).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Transaction'}</Button>
        </div>
      </form>
    </Form>
  );
};