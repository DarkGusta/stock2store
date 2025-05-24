
import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createProduct } from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const InventoryEmptyState: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const handleAddSampleProduct = async () => {
    toast({
      title: "Adding sample product",
      description: "Creating a sample product in your inventory...",
    });
    
    try {
      // First check if the test product category exists
      const { data: existingCategories } = await supabase
        .from('product_types')
        .select('id, name')
        .eq('name', 'Test Products')
        .limit(1);
      
      console.log("Checking for existing category:", existingCategories);
      
      let categoryId;
      
      if (existingCategories && existingCategories.length > 0) {
        // Use existing category
        categoryId = existingCategories[0].id;
        console.log("Using existing category with ID:", categoryId);
      } else {
        // Try to create the category - this might fail if RLS blocks it
        try {
          console.log("Creating new product type category...");
          const { data: newCategory, error: categoryError } = await supabase
            .from('product_types')
            .insert({ name: 'Test Products', tax_type: 0.0 })
            .select('id')
            .single();
          
          if (categoryError) {
            console.error("Error creating category:", categoryError);
            toast({
              title: "Category Creation Error",
              description: "Unable to create product category due to permissions. Please check console and RLS policies.",
              variant: "destructive",
            });
            return;
          }
          
          categoryId = newCategory.id;
          console.log("Created new category with ID:", categoryId);
        } catch (e) {
          console.error("Exception creating category:", e);
        }
      }
      
      if (!categoryId) {
        toast({
          title: "Error",
          description: "Could not find or create a product category. Check console for details.",
          variant: "destructive",
        });
        return;
      }
      
      // Now create the inventory item
      console.log("Creating inventory item with category ID:", categoryId);
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from('inventory')
        .insert({
          name: "Sample Product",
          description: "This is a test product created to verify database connectivity",
          quantity: 5,
          product_type_id: categoryId
        })
        .select('*')
        .single();
      
      if (inventoryError) {
        console.error('Error creating inventory item:', inventoryError);
        toast({
          title: "Error",
          description: "Failed to create inventory item: " + inventoryError.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Created inventory item:", inventoryItem);
      
      // Create a price for the product
      const { error: priceError } = await supabase
        .from('price')
        .insert({
          inventory_id: inventoryItem.id,
          amount: 19.99,
          status: true
        });
      
      if (priceError) {
        console.error('Error creating price:', priceError);
        // Continue anyway as we have the inventory item
      } else {
        console.log("Created price for inventory item");
      }
      
      toast({
        title: "Success!",
        description: "Sample product was created successfully.",
        variant: "default",
      });
      
      // Refresh product data
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
    } catch (error) {
      console.error('Error in sample product creation flow:', error);
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
