
import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InventoryEmptyState: React.FC = () => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <div className="inline-flex items-center justify-center bg-blue-100 p-3 rounded-full mb-4">
        <Package size={24} className="text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold">No products available</h3>
      <p className="text-gray-500 mt-1">
        There are currently no products in the database.
      </p>
      <Button 
        className="mt-4"
      >
        <Plus size={16} className="mr-2" />
        Add Your First Product
      </Button>
    </div>
  );
};

export default InventoryEmptyState;
