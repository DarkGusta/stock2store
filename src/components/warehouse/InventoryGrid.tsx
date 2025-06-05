
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';

interface InventoryGridProps {
  products: Product[];
}

const InventoryGrid: React.FC<InventoryGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <Card key={product.id}>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Category: {product.category}</p>
            <p>Stock: {product.stock}</p>
            <p>Location: {product.location || 'A1-01'}</p>
            <Badge variant={product.stock > 5 ? "default" : "destructive"}>
              {product.stock > 5 ? 'In Stock' : 'Low Stock'}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InventoryGrid;
