import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, createProduct, deleteProduct, updateProduct } from '@/services/productService';
import { ListCropForm } from '@/components/marketplace/ListCropForm';
import { EditCropForm } from '@/components/marketplace/EditCropForm';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Search, Filter, MapPin, Calendar, Star, MessageCircle, Heart, PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isListCropOpen, setIsListCropOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading, isError } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  const onSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    toast({ title: message });
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => { onSuccess("Your crop has been listed!"); setIsListCropOpen(false); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { onSuccess("Listing deleted!"); setDeletingProductId(null); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => { onSuccess("Listing updated!"); setEditingProduct(null); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: 'destructive' }),
  });

  const handleUpdateProduct = (productData: any) => {
    updateMutation.mutate({ productId: editingProduct._id, productData });
  };
  
  const filteredProducts = products.filter((p: any) => p.cropName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div><h1 className="text-3xl font-bold">Marketplace</h1><p className="text-muted-foreground">Buy and sell fresh crops directly.</p></div>
          {user?.role === 'farmer' && (
            <Dialog open={isListCropOpen} onOpenChange={setIsListCropOpen}>
              <DialogTrigger asChild><Button><PlusCircle className="h-4 w-4 mr-2"/>List Your Crop</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>List a New Crop for Sale</DialogTitle></DialogHeader><ListCropForm onSubmit={createMutation.mutate} onClose={() => setIsListCropOpen(false)} isPending={createMutation.isPending} /></DialogContent>
            </Dialog>
          )}
        </div>

        {/* ... Search and Filter UI ... */}
        
        {isLoading && <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>}
        {isError && <div className="text-center text-red-500">Failed to load market listings.</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <Card key={product._id} className="overflow-hidden group">
              <div className="relative">
                <img src={product.imageUrl} alt={product.cropName} className="w-full h-48 object-cover" />
                {user?.id === product.seller._id && (
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="secondary" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingProduct({ ...product, harvestDate: new Date(product.harvestDate) })}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingProductId(product._id)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div><h3 className="font-semibold text-lg">{product.cropName} <Badge variant="outline">{product.qualityGrade} Grade</Badge></h3><p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p></div>
                <div className="flex items-baseline gap-2"><span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString()}</span><span className="text-sm text-muted-foreground">/ {product.unit}</span></div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div><span className="font-medium">{product.quantity} {product.unit}</span> available</div>
                  <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{product.location}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-3 w-3" />Harvested {format(new Date(product.harvestDate), 'dd MMM, yyyy')}</div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Avatar className="h-8 w-8"><AvatarImage src={product.seller.profileImage} /><AvatarFallback>{product.seller.name.charAt(0)}</AvatarFallback></Avatar>
                  <span className="text-sm font-medium">{product.seller.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Product Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent><DialogHeader><DialogTitle>Edit Your Listing</DialogTitle></DialogHeader><EditCropForm initialData={editingProduct} onSubmit={handleUpdateProduct} onClose={() => setEditingProduct(null)} isPending={updateMutation.isPending} /></DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingProductId} onOpenChange={() => setDeletingProductId(null)}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete your product listing from the marketplace.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate(deletingProductId!)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Marketplace;