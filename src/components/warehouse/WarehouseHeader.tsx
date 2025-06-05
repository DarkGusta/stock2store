
import React from 'react';
import AddProductForm from '@/components/warehouse/AddProductForm';

interface WarehouseHeaderProps {
  categories: string[];
}

const WarehouseHeader: React.FC<WarehouseHeaderProps> = ({ categories }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Warehouse Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage your inventory, track stock levels, and analyze warehouse operations.
        </p>
      </div>
      <AddProductForm existingCategories={categories} />
    </div>
  );
};

export default WarehouseHeader;
