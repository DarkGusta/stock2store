
import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createProduct } from '@/services';
import { useQueryClient } from '@tanstack/react-query';

const InventoryEmptyState: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const handleAddSampleProduct = async () => {
    toast({
      title: "Adding sample product",
      description: "Creating a sample product in your inventory...",
    });
    
    try {
      const result = await createProduct({
        name: "Sample Product",
        description: "This is a test product created to verify database connectivity",
        price: 19.99,
        stock: 5,
        category: "Test Products",
        image: "",
        location: "",
        barcode: "TEST-12345"
      });
      
      if (result) {
        toast({
          title: "Success!",
          description: "Sample product was created successfully.",
          variant: "default",
        });
        // Refresh product data
        queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      } else {
        toast({
          title: "Error",
          description: "Failed to create sample product. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating sample product:', error);
      toast({
        title: "Error",
        description: "Failed to create sample product: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <div className="inline-flex items-center justify-center bg-blue-100 p-3 rounded-full mb-4">
        <Package size={24} className="text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold">No products available</h3>
      <p className="text-gray-500 mt-1">
        There are currently no products in the database.
      </p>
      <div className="mt-4 space-y-2">
        <Button>
          <Plus size={16} className="mr-2" />
          Add Your First Product
        </Button>
        <div className="mt-2">
          <Button 
            variant="outline"
            onClick={handleAddSampleProduct}
          >
            Add Sample Test Product
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          The test product button will help verify database connectivity
        </p>
      </div>
    </div>
  );
};

export default InventoryEmptyState;
