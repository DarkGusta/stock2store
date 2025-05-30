
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

type FormData = z.infer<typeof formSchema>;

interface AddProductFormProps {
  existingCategories: string[];
}

const AddProductForm: React.FC<AddProductFormProps> = ({ existingCategories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: 0,
      quantity: 1,
    },
  });

  const generateSerialId = (productName: string, category: string, index: number): string => {
    // Create a base from product name and category
    const namePrefix = productName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const categoryPrefix = category.replace(/\s+/g, '').substring(0, 2).toUpperCase();
    
    // Generate a serial number with padding
    const serialNumber = (index + 1).toString().padStart(3, '0');
    
    return `${namePrefix}${categoryPrefix}${serialNumber}`;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if category exists or create it
      let productTypeId: string;
      
      const { data: existingType } = await supabase
        .from('product_types')
        .select('id')
        .eq('name', data.category)
        .single();

      if (existingType) {
        productTypeId = existingType.id;
      } else {
        // Create new product type
        const { data: newType, error: typeError } = await supabase
          .from('product_types')
          .insert({
            name: data.category,
            tax_type: 0.0
          })
          .select('id')
          .single();

        if (typeError) throw typeError;
        productTypeId = newType.id;
      }

      // Create inventory item
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from('inventory')
        .insert({
          name: data.name,
          description: data.description || '',
          quantity: data.quantity,
          product_type_id: productTypeId
        })
        .select('*')
        .single();

      if (inventoryError) throw inventoryError;

      // Create price record
      const { error: priceError } = await supabase
        .from('price')
        .insert({
          inventory_id: inventoryItem.id,
          amount: data.price,
          status: true
        });

      if (priceError) throw priceError;

      // Get existing items count for this product to generate serial IDs
      const { data: existingItems } = await supabase
        .from('items')
        .select('serial_id')
        .eq('inventory_id', inventoryItem.id);

      const startIndex = existingItems?.length || 0;

      // Create individual items with auto-generated serial IDs
      const itemsToInsert = Array.from({ length: data.quantity }, (_, index) => ({
        inventory_id: inventoryItem.id,
        serial_id: generateSerialId(data.name, data.category, startIndex + index),
        status: 'available' as const
      }));

      const { error: itemsError } = await supabase
        .from('items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Create transaction records for inventory addition
      const transactionData = itemsToInsert.map(item => ({
        item_serial: item.serial_id,
        user_id: user.id,
        transaction_type: 'inventory_addition',
        notes: `New product added to inventory: ${data.name}`
      }));

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData);

      if (transactionError) {
        console.error('Error creating transaction records:', transactionError);
        // Don't throw here as the main operation succeeded
      }

      toast({
        title: 'Product Added Successfully',
        description: `Added ${data.quantity} units of ${data.name} to inventory`,
      });

      // Reset form and close dialog
      form.reset();
      setIsOpen(false);

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['warehouse-products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['detailed-inventory'] });

    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add product',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} className="mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Add a new product to the inventory with automatic serial ID generation.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Samsung Galaxy S21" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Product description..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select or type new category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {existingCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormControl>
                    <Input 
                      placeholder="Or type new category"
                      value={field.value}
                      onChange={field.onChange}
                      className="mt-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Product'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductForm;
