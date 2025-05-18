
import React from 'react';
import { Package, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose }) => {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle>{product.name}</CardTitle>
          <CardDescription>Product Detail</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500"
          onClick={onClose}
        >
          &times;
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="bg-gray-100 rounded-md mb-3 h-48 flex items-center justify-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="object-contain max-h-full"
                />
              ) : (
                <Package size={48} className="text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-500">{product.description}</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-semibold">${product.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stock Level</p>
              <p className="font-semibold">{product.stock} units</p>
            </div>
            {product.barcode && (
              <div>
                <p className="text-sm text-gray-500">Barcode</p>
                <p className="font-mono">{product.barcode}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{product.location}</p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button size="sm" variant="outline">
                <ArrowDown size={16} className="mr-2" />
                Stock In
              </Button>
              <Button size="sm" variant="outline">
                <ArrowUp size={16} className="mr-2" />
                Stock Out
              </Button>
              <Button size="sm">
                Update
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDetail;
