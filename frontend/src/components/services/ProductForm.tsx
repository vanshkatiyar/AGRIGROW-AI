import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

interface ProductItem {
  name: string;
  category: string;
  price: string;
  unit: string;
  description: string;
  inStock: boolean;
}

interface ProductFormProps {
  products: ProductItem[];
  onChange: (products: ProductItem[]) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ products, onChange }) => {
  const handleChange = (index: number, field: keyof ProductItem, value: string | boolean) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    onChange(newProducts);
  };

  const addProduct = () => {
    onChange([
      ...products,
      { name: '', category: '', price: '', unit: '', description: '', inStock: true }
    ]);
  };

  const removeProduct = (index: number) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    onChange(newProducts);
  };

  return (
    <div className="space-y-4">
      <Label>Products</Label>
      {products.map((item, index) => (
        <div key={index} className="border p-4 rounded-md space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Product #{index + 1}</h4>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => removeProduct(index)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`name-${index}`}>Product Name</Label>
              <Input
                id={`name-${index}`}
                value={item.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                placeholder="Product Name"
              />
            </div>
            <div>
              <Label htmlFor={`category-${index}`}>Category</Label>
              <Input
                id={`category-${index}`}
                value={item.category}
                onChange={(e) => handleChange(index, 'category', e.target.value)}
                placeholder="Seeds, Fertilizers, etc."
              />
            </div>
            <div>
              <Label htmlFor={`price-${index}`}>Price (₹)</Label>
              <Input
                id={`price-${index}`}
                type="number"
                value={item.price}
                onChange={(e) => handleChange(index, 'price', e.target.value)}
                placeholder="Price"
              />
            </div>
            <div>
              <Label htmlFor={`unit-${index}`}>Unit</Label>
              <Input
                id={`unit-${index}`}
                value={item.unit}
                onChange={(e) => handleChange(index, 'unit', e.target.value)}
                placeholder="kg, liter, packet"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor={`description-${index}`}>Description</Label>
              <textarea
                id={`description-${index}`}
                value={item.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                placeholder="Product description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <input
                  id={`inStock-${index}`}
                  type="checkbox"
                  checked={item.inStock}
                  onChange={(e) => handleChange(index, 'inStock', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`inStock-${index}`}>In Stock</Label>
              </div>
            </div>
          </div>
        </div>
      ))}
      <Button type="button" onClick={addProduct} variant="outline">
        Add Product
      </Button>
    </div>
  );
};

export default ProductForm;