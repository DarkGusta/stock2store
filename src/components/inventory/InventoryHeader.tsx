
import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryHeaderProps {
  onRefresh: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold">Inventory Management</h1>
        <p className="text-gray-500">Manage and update your product inventory</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
        <Button>
          <Plus size={16} className="mr-2" />
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
