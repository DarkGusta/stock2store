
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types';

interface ShelfMappingProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

const ShelfMapping: React.FC<ShelfMappingProps> = ({ products, onProductSelect }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shelf Mapping</CardTitle>
        <CardDescription>Visual representation of warehouse shelves and product locations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <div 
              key={product.id}
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => onProductSelect(product)}
            >
              <div className="text-sm font-medium">{product.name}</div>
              <div className="text-xs text-gray-500">Stock: {product.stock}</div>
              <div className="text-xs text-gray-500">Location: {product.location || 'A1-01'}</div>
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products mapped to shelves yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShelfMapping;
