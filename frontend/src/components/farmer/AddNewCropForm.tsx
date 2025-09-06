import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { REAL_CROP_DATA } from "@/utils/realCropData";

// Get crop names from our new data source
const cropOptions = Object.keys(REAL_CROP_DATA);

const formSchema = z.object({
  name: z.string({ required_error: "Please select a crop." }),
  areaInAcres: z.coerce.number().min(0.1, "Area must be at least 0.1 acres."),
  plantingDate: z.date({ required_error: "Planting date is required." }),
  expectedYield: z.string().min(1, "Expected yield is required."),
  estimatedRevenue: z.coerce.number().min(0, "Estimated revenue cannot be negative."),
});

interface AddNewCropFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onClose: () => void;
  isPending: boolean;
}

export const AddNewCropForm: React.FC<AddNewCropFormProps> = ({ onSubmit, onClose, isPending }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const selectedCropName = form.watch('name');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Crop Name</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a crop to plant" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cropOptions.map(crop => <SelectItem key={crop} value={crop}>{crop}</SelectItem>)}
                </SelectContent>
              </Select>
              {selectedCropName && (
                <FormDescription className="text-xs">
                  Sowing: {REAL_CROP_DATA[selectedCropName]?.sowing} | Harvest: {REAL_CROP_DATA[selectedCropName]?.harvest}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="areaInAcres" render={({ field }) => ( <FormItem><FormLabel>Area (acres)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="plantingDate" render={({ field }) => ( <FormItem className="flex flex-col pt-2"><FormLabel className="mb-2">Planting Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
        </div>

        <FormField control={form.control} name="expectedYield" render={({ field }) => ( <FormItem><FormLabel>Expected Yield</FormLabel><FormControl><Input placeholder="e.g., 50 quintals" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="estimatedRevenue" render={({ field }) => ( <FormItem><FormLabel>Est. Revenue (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g., 150000" {...field} /></FormControl><FormMessage /></FormItem>)} />

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Adding...' : 'Add Crop'}</Button>
        </div>
      </form>
    </Form>
  );
};