import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Star, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock Data
const supplierServices = [
  { id: 1, name: 'Agri-Inputs Co.', location: 'Pune, Maharashtra', rating: 4.8, products: ['Seeds', 'Fertilizers'], image: '/path/to/avatar1.jpg' },
  { id: 2, name: 'Farm Essentials', location: 'Nashik, Maharashtra', rating: 4.7, products: ['Pesticides', 'Tools'], image: '/path/to/avatar2.jpg' },
  { id: 3, name: 'Green Growth Suppliers', location: 'Satara, Maharashtra', rating: 4.9, products: ['Organic Manure'], image: '/path/to/avatar3.jpg' },
  { id: 4, name: 'CropCare Traders', location: 'Ahmednagar, Maharashtra', rating: 4.6, products: ['All Products'], image: '/path/to/avatar4.jpg' },
];

const SupplierServicePage = () => {
  return (
    <Layout>
      <div className="container-responsive mx-auto p-4 sm:p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Supplier Services</h1>
          <p className="text-muted-foreground text-lg">Find trusted suppliers for all your farming needs.</p>
        </header>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2 lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">Search by Name or Product</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input id="search" placeholder="e.g., Seeds, Agri-Inputs..." className="pl-10" />
                </div>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                <Select>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pune">Pune</SelectItem>
                    <SelectItem value="nashik">Nashik</SelectItem>
                    <SelectItem value="satara">Satara</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Service Providers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {supplierServices.map(service => (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={service.image} alt={service.name} />
                  <AvatarFallback>{service.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{service.location}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-5 w-5" />
                    <span className="font-bold text-base">{service.rating}</span>
                  </div>
                  <Button size="sm">View Details</Button>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Main Products:</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.products.map(s => (
                      <span key={s} className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SupplierServicePage;