import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Phone, 
  Star, 
  Clock, 
  Tractor, 
  Truck, 
  Package, 
  Factory,
  Search,
  Filter,
  GitCompareArrows, // Corrected from Compare
  MessageCircle,
  IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface ServiceProvider {
  _id: string;
  businessName: string;
  description: string;
  serviceType: 'tractor' | 'harvester' | 'supplier' | 'manufacturer';
  location: {
    address: string;
    coordinates: { latitude: number; longitude: number };
  };
  contactInfo: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  equipment?: Array<{
    name: string;
    model: string;
    hourlyRate: number;
    dailyRate: number;
    availability: boolean;
    images: string[];
  }>;
  products?: Array<{
    name: string;
    category: string;
    price: number;
    unit: string;
    description: string;
    inStock: boolean;
  }>;
  ratings: {
    average: number;
    count: number;
  };
  owner: {
    name: string;
    profileImage: string;
  };
  isVerified: boolean;
}

const ServiceDiscovery: React.FC = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);

  const serviceTypes = [
    { value: 'all', label: 'All Services', icon: Package },
    { value: 'tractor', label: 'Tractor Owners', icon: Tractor },
    { value: 'harvester', label: 'Harvester Owners', icon: Truck },
    { value: 'supplier', label: 'Suppliers', icon: Package },
    { value: 'manufacturer', label: 'Manufacturers', icon: Factory }
  ];

  useEffect(() => {
    fetchProviders();
  }, [selectedType, searchQuery, location]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/services/search';
      const params = new URLSearchParams();
      
      if (selectedType !== 'all') params.append('serviceType', selectedType);
      if (searchQuery) params.append('q', searchQuery);
      if (location) params.append('location', location);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to fetch service providers');
    } finally {
      setLoading(false);
    }
  };

  const handleCompareToggle = (providerId: string) => {
    setCompareList(prev => {
      if (prev.includes(providerId)) {
        return prev.filter(id => id !== providerId);
      } else if (prev.length < 3) {
        return [...prev, providerId];
      } else {
        toast.error('You can compare up to 3 providers only');
        return prev;
      }
    });
  };

  const handleContactProvider = async (provider: ServiceProvider) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/services/request', {
        serviceProviderId: provider._id,
        serviceType: provider.serviceType,
        requestType: 'inquiry',
        serviceDetails: {
          farmLocation: { address: location || 'Not specified' }
        },
        message: `Hi, I'm interested in your ${provider.serviceType} services. Please provide more details.`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Inquiry sent successfully!');
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast.error('Failed to send inquiry');
    }
  };

  const getServiceIcon = (type: string) => {
    const iconMap = {
      tractor: Tractor,
      harvester: Truck,
      supplier: Package,
      manufacturer: Factory
    };
    return iconMap[type as keyof typeof iconMap] || Package;
  };

  const ServiceProviderCard: React.FC<{ provider: ServiceProvider }> = ({ provider }) => {
    const ServiceIcon = getServiceIcon(provider.serviceType);
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ServiceIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{provider.businessName}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {provider.serviceType}
                  </Badge>
                  {provider.isVerified && (
                    <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCompareToggle(provider._id)}
              className={compareList.includes(provider._id) ? 'bg-blue-50' : ''}
            >
              <GitCompareArrows className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">{provider.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{provider.location.address}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{provider.ratings.average.toFixed(1)} ({provider.ratings.count})</span>
            </div>
          </div>
          
          {provider.equipment && provider.equipment.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Available Equipment:</h4>
              <div className="grid grid-cols-1 gap-2">
                {provider.equipment.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold flex items-center">
                        <IndianRupee className="h-3 w-3" />
                        {item.hourlyRate}/hr
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <IndianRupee className="h-3 w-3" />
                        {item.dailyRate}/day
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {provider.products && provider.products.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Products Available:</h4>
              <div className="flex flex-wrap gap-1">
                {provider.products.slice(0, 3).map((product, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {product.name}
                  </Badge>
                ))}
                {provider.products.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{provider.products.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={provider.owner.profileImage} />
                <AvatarFallback>{provider.owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{provider.owner.name}</span>
            </div>
            
            <div className="flex space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSelectedProvider(provider)}>
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{provider.businessName}</DialogTitle>
                  </DialogHeader>
                  <ServiceProviderDetails provider={provider} />
                </DialogContent>
              </Dialog>
              
              <Button size="sm" onClick={() => handleContactProvider(provider)}>
                <MessageCircle className="h-4 w-4 mr-1" />
                Contact
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ServiceProviderDetails: React.FC<{ provider: ServiceProvider }> = ({ provider }) => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={provider.owner.profileImage} />
          <AvatarFallback>{provider.owner.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{provider.businessName}</h3>
          <p className="text-gray-600">Owner: {provider.owner.name}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{provider.ratings.average.toFixed(1)} ({provider.ratings.count} reviews)</span>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2">Description</h4>
        <p className="text-gray-600">{provider.description}</p>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2">Contact Information</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>{provider.contactInfo.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{provider.location.address}</span>
          </div>
        </div>
      </div>
      
      {provider.equipment && provider.equipment.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Equipment & Rates</h4>
          <div className="grid gap-3">
            {provider.equipment.map((item, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{item.name}</h5>
                    <p className="text-sm text-gray-600">Model: {item.model}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {item.hourlyRate}/hour
                    </div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {item.dailyRate}/day
                    </div>
                    <Badge variant={item.availability ? "default" : "secondary"} className="mt-1">
                      {item.availability ? "Available" : "Busy"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {provider.products && provider.products.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Products</h4>
          <div className="grid gap-3">
            {provider.products.map((product, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{product.name}</h5>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <Badge variant="outline" className="mt-1">{product.category}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {product.price}/{product.unit}
                    </div>
                    <Badge variant={product.inStock ? "default" : "secondary"} className="mt-1">
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Discovery</h1>
          <p className="text-gray-600 mt-1">Find nearby tractor owners, suppliers, and manufacturers</p>
        </div>
        
        {compareList.length > 0 && (
          <Button className="md:w-auto">
            Compare Selected ({compareList.length})
          </Button>
        )}
      </div>
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services, equipment, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <type.icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Service Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : providers.length > 0 ? (
          providers.map((provider) => (
            <ServiceProviderCard key={provider._id} provider={provider} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service providers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or location</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDiscovery;