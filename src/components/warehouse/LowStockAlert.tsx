
import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';

interface LowStockAlertProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onViewAllInventory: () => void;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ 
  products, 
  onProductSelect, 
  onViewAllInventory 
}) => {
  // Get just the 5 products with lowest stock
  const lowStockProducts = [...products]
    .sort((a, b) => a.stock - b.stock)
    .filter(p => p.stock <= 10)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Alert</CardTitle>
        <CardDescription>Products that need reordering</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lowStockProducts.map(product => (
          <div 
            key={product.id} 
            className="flex items-center justify-between border-b pb-3 last:border-0 cursor-pointer"
            onClick={() => onProductSelect(product)}
          >
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden mr-3">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package size={16} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                <p className="text-xs text-gray-500">Location: {product.location}</p>
              </div>
            </div>
            <Badge 
              variant={product.stock === 0 ? "destructive" : "outline"} 
              className="ml-2"
            >
              {product.stock} left
            </Badge>
          </div>
        ))}
        <Button variant="outline" className="w-full" onClick={onViewAllInventory}>
          View All Inventory
        </Button>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
