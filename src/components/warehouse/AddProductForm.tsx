
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';

interface AddProductFormProps {
  existingCategories: string[];
}

interface FormData {
  name: string;
  description: string;
  category: string;
  newCategory?: string;
  quantity: number;
  price: number;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ existingCategories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryType, setCategoryType] = useState<'existing' | 'new'>('existing');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch product types from database
  const { data: productTypes = [] } = useQuery({
    queryKey: ['product-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_types')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching product types:', error);
        throw error;
      }

      return data || [];
    }
  });

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      newCategory: '',
      quantity: 1,
      price: 0
    }
  });

  const generateSerialPrefix = (productName: string, category: string) => {
    // Extract first letters from product name and category
    const nameWords = productName.trim().split(' ');
    const categoryWords = category.trim().split(' ');
    
    let namePrefix = '';
    let categoryPrefix = '';
    
    // Get first 2 letters from each significant word in product name
    nameWords.forEach(word => {
      if (word.length > 0) {
        namePrefix += word.substring(0, 1).toUpperCase();
      }
    });
    
    // Get first 2 letters from each significant word in category
    categoryWords.forEach(word => {
      if (word.length > 0) {
        categoryPrefix += word.substring(0, 1).toUpperCase();
      }
    });
    
    // Ensure we have at least 2 characters for each part
    namePrefix = namePrefix.padEnd(2, 'X').substring(0, 2);
    categoryPrefix = categoryPrefix.padEnd(2, 'X').substring(0, 2);
    
    return `${namePrefix}-${categoryPrefix}`;
  };

  const findAvailableLocation = async () => {
    // First, get all occupied locations from items
    const { data: occupiedLocations } = await supabase
      .from('items')
      .select('location_id, locations(shelf_number, slot_number)')
      .not('location_id', 'is', null);

    // Generate all possible locations (shelves A-D, rows 1-3, slots 1-4)
    const shelves = ['A', 'B', 'C', 'D'];
    const rows = [1, 2, 3];
    const slots = [1, 2, 3, 4];
    
    const allPossibleLocations = [];
    for (const shelf of shelves) {
      for (const row of rows) {
        for (const slot of slots) {
          allPossibleLocations.push(`${shelf}${row}-${slot.toString().padStart(2, '0')}`);
        }
      }
    }

    // Create a set of occupied location strings for quick lookup
    const occupiedLocationStrings = new Set();
    if (occupiedLocations) {
      occupiedLocations.forEach((item: any) => {
        if (item.locations) {
          const locationString = `${item.locations.shelf_number}${item.locations.slot_number}`;
          occupiedLocationStrings.add(locationString);
        }
      });
    }

    // Find the first available location
    for (const location of allPossibleLocations) {
      if (!occupiedLocationStrings.has(location)) {
        return location;
      }
    }

    // If all locations are occupied, return null
    return null;
  };

  const createLocationIfNotExists = async (locationString: string) => {
    // Parse location string (e.g., "A1-01" -> shelf: "A", slot: "1-01")
    const [shelf, slot] = locationString.split(/(\d)/);
    const shelfNumber = shelf;
    const slotNumber = locationString.substring(1); // Everything after the shelf letter

    // Check if location already exists
    const { data: existingLocation } = await supabase
      .from('locations')
      .select('id')
      .eq('shelf_number', shelfNumber)
      .eq('slot_number', slotNumber)
      .single();

    if (existingLocation) {
      return existingLocation.id;
    }

    // Create new location
    const { data: newLocation, error } = await supabase
      .from('locations')
      .insert({
        shelf_number: shelfNumber,
        slot_number: slotNumber,
        capacity: 100, // Set higher capacity for multiple items
        status: true
      })
      .select('id')
      .single();

    if (error) throw error;
    return newLocation.id;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const finalCategory = categoryType === 'new' ? data.newCategory! : data.category;

      // Check if product type exists, if not create it
      let productTypeId: string;
      const { data: existingType } = await supabase
        .from('product_types')
        .select('id')
        .eq('name', finalCategory)
        .single();

      if (existingType) {
        productTypeId = existingType.id;
      } else {
        const { data: newType, error: typeError } = await supabase
          .from('product_types')
          .insert({
            name: finalCategory,
            description: `Auto-generated product type for ${finalCategory}`,
            tax_type: 0.1 // Default tax rate
          })
          .select('id')
          .single();

        if (typeError) throw typeError;
        productTypeId = newType.id;
      }

      // Create inventory entry
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .insert({
          name: data.name,
          description: data.description,
          quantity: data.quantity,
          product_type_id: productTypeId,
          status: true
        })
        .select('id')
        .single();

      if (inventoryError) throw inventoryError;

      // Check if a price already exists for this inventory item
      const { data: existingPrice } = await supabase
        .from('price')
        .select('id')
        .eq('inventory_id', inventory.id)
        .eq('status', true)
        .single();

      // Only create price if it doesn't exist
      if (!existingPrice) {
        const { error: priceError } = await supabase
          .from('price')
          .insert({
            inventory_id: inventory.id,
            amount: data.price,
            status: true
          });

        if (priceError) throw priceError;
      } else {
        // Update existing price
        const { error: priceUpdateError } = await supabase
          .from('price')
          .update({ amount: data.price })
          .eq('id', existingPrice.id);

        if (priceUpdateError) throw priceUpdateError;
      }

      // Generate serial prefix
      const serialPrefix = generateSerialPrefix(data.name, finalCategory);

      // Find the next available serial number for this prefix
      const { data: existingItems } = await supabase
        .from('items')
        .select('serial_id')
        .like('serial_id', `${serialPrefix}-%`);

      let nextNumber = 1;
      if (existingItems && existingItems.length > 0) {
        const numbers = existingItems
          .map(item => {
            const parts = item.serial_id.split('-');
            const numberPart = parts[parts.length - 1];
            return parseInt(numberPart, 10);
          })
          .filter(num => !isNaN(num));
        
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        }
      }

      // Find one available location for all items of this product
      const availableLocation = await findAvailableLocation();
      let locationId = null;
      
      if (availableLocation) {
        locationId = await createLocationIfNotExists(availableLocation);
      }

      // Create individual items with sequential serial IDs all at the same location
      const itemsToCreate = [];
      for (let i = 0; i < data.quantity; i++) {
        const serialNumber = (nextNumber + i).toString().padStart(2, '0');

        itemsToCreate.push({
          serial_id: `${serialPrefix}-${serialNumber}`,
          inventory_id: inventory.id,
          status: 'available',
          location_id: locationId // All items go to the same location
        });
      }

      const { error: itemsError } = await supabase
        .from('items')
        .insert(itemsToCreate);

      if (itemsError) throw itemsError;

      // Create transaction records for each item
      const transactionRecords = itemsToCreate.map(item => ({
        item_serial: item.serial_id,
        user_id: user.id,
        transaction_type: 'stock_in',
        notes: `New product added to inventory: ${data.name}${item.location_id ? ` at ${availableLocation}` : ''}`,
        destination_location_id: item.location_id
      }));

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionRecords);

      if (transactionError) throw transactionError;

      toast({
        title: 'Product Added Successfully',
        description: `Added ${data.quantity} units of ${data.name} to inventory${availableLocation ? ` at location ${availableLocation}` : ''}`,
      });

      // Reset form and close dialog
      form.reset();
      setIsOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['warehouse-products'] });
      queryClient.invalidateQueries({ queryKey: ['detailed-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['detailed-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-types'] });

    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your inventory. All items will be grouped together at the same location.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Product name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ThinkPad X1" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Product description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>Category</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="existing"
                    checked={categoryType === 'existing'}
                    onChange={() => setCategoryType('existing')}
                  />
                  <span>Existing</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="new"
                    checked={categoryType === 'new'}
                    onChange={() => setCategoryType('new')}
                  />
                  <span>New</span>
                </label>
              </div>

              {categoryType === 'existing' ? (
                <FormField
                  control={form.control}
                  name="category"
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {productTypes.map((type) => (
                              <SelectItem key={type.id} value={type.name}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="newCategory"
                  rules={{ required: 'New category name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Enter new category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                rules={{ 
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Quantity must be at least 1' }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                rules={{ 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be non-negative' }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Product'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductForm;
