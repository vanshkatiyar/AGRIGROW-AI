import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadCloud, XCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
  profileImage: z.any().optional(),
  coverPhoto: z.any().optional(),
});

interface EditProfileFormProps {
  initialData: any;
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
  isPending: boolean;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ initialData, onSubmit, onClose, isPending }) => {
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { name: initialData.name, bio: initialData.bio, gender: initialData.gender } });
  
  const [profilePreview, setProfilePreview] = useState<string | null>(initialData.profileImage);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData.coverPhoto);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'profileImage' | 'coverPhoto', setPreview: (url: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue(fieldName, file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Form Fields for profile image, cover photo, name, bio, gender */}
        <FormField control={form.control} name="profileImage" render={() => (
            <FormItem><FormLabel>Profile Picture</FormLabel><FormControl>
                <label className="block cursor-pointer"><div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center text-muted-foreground hover:bg-muted bg-cover bg-center" style={{backgroundImage: `url(${profilePreview})`}}>{!profilePreview && <UploadCloud/>}</div><Input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profileImage', setProfilePreview)}/></label>
            </FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="coverPhoto" render={() => (
            <FormItem><FormLabel>Cover Photo</FormLabel><FormControl>
                <label className="block cursor-pointer"><div className="w-full h-32 rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground hover:bg-muted bg-cover bg-center" style={{backgroundImage: `url(${coverPreview})`}}>{!coverPreview && <UploadCloud/>}</div><Input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'coverPhoto', setCoverPreview)}/></label>
            </FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea placeholder="Tell us about yourself" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender"/></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </Form>
  );
};