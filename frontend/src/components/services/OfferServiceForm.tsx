import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EquipmentForm from '@/components/services/EquipmentForm';
import ProductForm from '@/components/services/ProductForm';

const formSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  description: z.string().min(10, 'Description is required'),
  address: z.string().min(5, 'Address is required'),
  latitude: z.string().min(1, 'Latitude is required').regex(/^-?\d+(\.\d+)?$/, 'Must be a valid number'),
  longitude: z.string().min(1, 'Longitude is required').regex(/^-?\d+(\.\d+)?$/, 'Must be a valid number'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Invalid email address').optional(),
  whatsapp: z.string().optional(),
});

interface EquipmentItem {
  name: string;
  model: string;
  year: string;
  hourlyRate: string;
  dailyRate: string;
  availability: boolean;
}

interface ProductItem {
  name: string;
  category: string;
  price: string;
  unit: string;
  description: string;
  inStock: boolean;
}

interface OfferServiceFormProps {
  serviceType: 'tractor' | 'harvester' | 'supplier';
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const OfferServiceForm: React.FC<OfferServiceFormProps> = ({ serviceType, onSubmit, isLoading }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      phone: '',
      email: '',
      whatsapp: '',
    },
  });

  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Create a new object that includes both form values and additional data
    const formData = {
      ...values,
      serviceType,
      ...(serviceType === 'tractor' || serviceType === 'harvester' ? { equipment } : {}),
      ...(serviceType === 'supplier' ? { products } : {})
    };
    
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Service</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John's Tractors" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your services" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Your business address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 28.6139" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 77.2090" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your WhatsApp number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Conditionally render EquipmentForm or ProductForm */}
            {(serviceType === 'tractor' || serviceType === 'harvester') && (
              <EquipmentForm
                equipment={equipment}
                onChange={setEquipment}
              />
            )}
            
            {serviceType === 'supplier' && (
              <ProductForm
                products={products}
                onChange={setProducts}
              />
            )}
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OfferServiceForm;