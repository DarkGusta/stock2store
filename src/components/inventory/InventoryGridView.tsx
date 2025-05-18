
import React from 'react';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';

interface InventoryGridViewProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (product: Product) => void;
}

const InventoryGridView: React.FC<InventoryGridViewProps> = ({
  products,
  onEdit,
  onDelete,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default InventoryGridView;
