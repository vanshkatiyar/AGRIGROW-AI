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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

// Define the validation schema for the form
const formSchema = z.object({
  name: z.string({ required_error: "Please select a crop." }),
  areaInAcres: z.coerce.number().min(0.1, "Area must be at least 0.1 acres."),
  plantingDate: z.date({ required_error: "Planting date is required." }),
  expectedYield: z.string().min(1, "Expected yield is required."),
  estimatedRevenue: z.coerce.number().min(0, "Estimated revenue cannot be negative."),
});

// A list of common crops for the dropdown
const cropOptions = ["Wheat", "Sugarcane", "Rice", "Cotton", "Maize", "Potato", "Tomato", "Onion"];

interface AddNewCropFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onClose: () => void;
}

export const AddNewCropForm: React.FC<AddNewCropFormProps> = ({ onSubmit, onClose }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="areaInAcres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area (in acres)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="plantingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Planting Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
          control={form.control}
          name="expectedYield"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Yield</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 50 quintals/acre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="estimatedRevenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Revenue (₹)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 150000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Crop</Button>
        </div>
      </form>
    </Form>
  );
};