
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ExternalLink } from 'lucide-react';
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
  // Filter products with low stock (less than 10)
  const lowStockProducts = products
    .filter(product => product.stock < 10)
    .sort((a, b) => a.stock - b.stock); // Sort by lowest stock first
  
  const lowStockCount = lowStockProducts.length;
  
  return (
    <Card className="bg-card dark:bg-card border-border dark:border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center text-card-foreground">
            <AlertTriangle size={18} className="text-amber-500 mr-2" />
            Low Stock Alert
          </CardTitle>
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-medium px-2.5 py-0.5 rounded">
            {lowStockCount} items
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {lowStockProducts.length > 0 ? (
          <>
            <div className="space-y-3 mb-3 max-h-[200px] overflow-y-auto">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  onClick={() => onProductSelect(product)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.category} · ID: {product.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className={`text-sm font-medium px-2.5 py-0.5 rounded 
                    ${product.stock === 0 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' 
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'}`
                    }
                  >
                    {product.stock} left
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {lowStockProducts.length > 5 && `+${lowStockProducts.length - 5} more items`}
              </p>
              <Button variant="ghost" size="sm" className="text-xs" onClick={onViewAllInventory}>
                View All <ExternalLink size={14} className="ml-1" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">All products have sufficient stock.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
