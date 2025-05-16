
import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Product } from '@/types';

interface ShelfMappingProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

const ShelfMapping: React.FC<ShelfMappingProps> = ({ products, onProductSelect }) => {
  // Group products by location
  const productsByLocation = products.reduce<Record<string, Product[]>>((acc, product) => {
    if (product.location) {
      if (!acc[product.location]) {
        acc[product.location] = [];
      }
      acc[product.location].push(product);
    }
    return acc;
  }, {});

  // Define shelf structure (rows and sections)
  const shelfRows = ['A', 'B', 'C', 'D'];
  const shelfSections = [1, 2, 3, 4, 5, 6];

  // Get color based on stock level
  const getStockColor = (stock: number) => {
    if (stock <= 0) return 'bg-red-500';
    if (stock <= 5) return 'bg-yellow-500';
    if (stock <= 20) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Warehouse Shelf Mapping</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {shelfRows.map(row => (
            <div key={row} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-md font-semibold">
                  {row}
                </div>
                <div className="h-2 bg-gray-200 flex-grow"></div>
              </div>
              <div className="grid grid-cols-6 gap-4 pl-10">
                {shelfSections.map(section => {
                  const locationKey = `${row}${section}`;
                  const productsInLocation = productsByLocation[locationKey] || [];
                  
                  return (
                    <div 
                      key={section} 
                      className="border rounded-md p-2 h-24 flex flex-col relative"
                    >
                      <div className="text-xs text-gray-500 absolute top-1 right-1">
                        {locationKey}
                      </div>
                      
                      {productsInLocation.length > 0 ? (
                        <div className="flex-1 flex flex-col gap-1 overflow-auto">
                          {productsInLocation.map(product => (
                            <TooltipProvider key={product.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full p-1 h-auto text-xs justify-between cursor-pointer"
                                    onClick={() => onProductSelect(product)}
                                  >
                                    <span className="truncate max-w-[80%] text-left">{product.name}</span>
                                    <span className={`w-3 h-3 rounded-full ${getStockColor(product.stock)}`}></span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs">Stock: {product.stock}</p>
                                    <p className="text-xs">ID: {product.id.substring(0, 8)}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                          <Package size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-xs">Out of stock</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-xs">Low stock</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-xs">Good stock</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-xs">High stock</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Print Shelf Layout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShelfMapping;
