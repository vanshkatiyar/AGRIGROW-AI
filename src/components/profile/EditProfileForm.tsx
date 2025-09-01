import { useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/context/AuthContext';
import { UploadCloud, XCircle } from 'lucide-react';

interface EditProfileFormProps {
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
  isPending: boolean;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ onSubmit, onClose, isPending }) => {
  const { user } = useAuth();
  const form = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      gender: user?.gender || '',
      role: user?.role || '',
      profileImage: undefined,
      coverPhoto: undefined,
    }
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(user?.profileImage || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(user?.coverPhoto || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'profileImage' | 'coverPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue(fieldName, file as any);
      if (fieldName === 'profileImage') setProfilePreview(URL.createObjectURL(file));
      if (fieldName === 'coverPhoto') setCoverPreview(URL.createObjectURL(file));
    }
  };
  
  const handleFormSubmit = (values: any) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value as string | Blob);
    });
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Image Uploads */}
        <div className="grid grid-cols-2 gap-4">
            <FormItem><FormLabel>Profile Picture</FormLabel><label className="..."><UploadCloud/><Input type="file" onChange={(e) => handleFileChange(e, 'profileImage')} /></label>{profilePreview && <img src={profilePreview} />}</FormItem>
            <FormItem><FormLabel>Cover Photo</FormLabel><label className="..."><UploadCloud/><Input type="file" onChange={(e) => handleFileChange(e, 'coverPhoto')} /></label>{coverPreview && <img src={coverPreview} />}</FormItem>
        </div>
        {/* Text Fields */}
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
        <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></FormItem>)} />
          <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="farmer">Farmer</SelectItem><SelectItem value="buyer">Buyer</SelectItem><SelectItem value="expert">Expert</SelectItem></SelectContent></Select></FormItem>)} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </Form>
  );
};