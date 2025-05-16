
import React from 'react';
import { Edit, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showActions = true,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= 5) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      <div className="relative h-48 bg-gray-100">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-200">
            <Package size={48} className="text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className={stockStatus.color}>
            {stockStatus.label}
          </Badge>
        </div>
      </div>
      
      <CardContent className="pt-4 flex-grow">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
        </div>
        {product.location && (
          <div className="mt-2">
            <span className="text-xs text-gray-500">Location: {product.location}</span>
          </div>
        )}
      </CardContent>
      
      {showActions && (
        <CardFooter className="border-t p-4 bg-gray-50">
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSelect && onSelect(product)}
            >
              Details
            </Button>
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(product.id)}
                >
                  <Edit size={16} />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductCard;
