
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/services';
import { supabase } from '@/integrations/supabase/client';
import { Product, InventoryMovement } from '@/types';

export const useWarehouseData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['warehouse-products'],
    queryFn: getProducts,
  });

  // Fetch inventory movements (transactions) with improved user profile handling
  const { data: inventoryMovements = [] } = useQuery({
    queryKey: ['inventory-movements'],
    queryFn: async () => {
      console.log('Fetching inventory movements...');
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          items!inner (
            serial_id,
            inventory (
              name,
              id
            )
          ),
          orders (
            order_number,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      console.log('Raw transactions data:', data);

      // Get all unique user IDs from transactions and orders
      const transactionUserIds = data.map(t => t.user_id).filter(Boolean);
      const orderUserIds = data.filter(t => t.orders?.user_id).map(t => t.orders.user_id).filter(Boolean);
      const allUserIds = [...new Set([...transactionUserIds, ...orderUserIds])];
      
      console.log('All user IDs to fetch profiles for:', allUserIds);

      // Fetch user profiles separately with better error handling
      let profilesMap = new Map();
      if (allUserIds.length > 0) {
        try {
          console.log('Fetching profiles for user IDs:', allUserIds);
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, email, role')
            .in('id', allUserIds);
          
          if (profileError) {
            console.error('Error fetching profiles:', profileError);
          } else {
            console.log('Fetched profiles:', profiles);
            if (profiles) {
              profiles.forEach(profile => {
                profilesMap.set(profile.id, profile);
              });
            }
          }
        } catch (profileError) {
          console.warn('Could not fetch user profiles:', profileError);
        }
      }

      console.log('Profiles map:', Object.fromEntries(profilesMap));

      const movements = data.map((transaction: any) => {
        const transactionUserProfile = profilesMap.get(transaction.user_id);
        const orderUserProfile = transaction.orders?.user_id ? profilesMap.get(transaction.orders.user_id) : null;
        
        console.log(`Transaction ${transaction.id}:`, {
          transactionUserId: transaction.user_id,
          transactionUserProfile,
          orderUserId: transaction.orders?.user_id,
          orderUserProfile,
          transactionType: transaction.transaction_type,
          notes: transaction.notes
        });
        
        // The transaction user_id is ALWAYS who performed the action
        const performedByUser = transactionUserProfile;
        const performedByName = performedByUser?.name || `User ${transaction.user_id?.slice(0, 8)}...` || 'System';
        const performedByRole = performedByUser?.role || 'unknown';
        
        // For customer display: ALWAYS use the order customer if there's an order
        // This ensures rejected orders show the correct customer who placed the order
        let customerName = 'N/A';
        let customerEmail = 'N/A';
        
        if (transaction.orders?.user_id && orderUserProfile) {
          // If there's an order, ALWAYS show the order customer (regardless of who performed the action)
          customerName = orderUserProfile.name || `User ${transaction.orders.user_id.slice(0, 8)}...`;
          customerEmail = orderUserProfile.email || 'No email';
        } else if (!transaction.orders && transaction.user_id === transaction.user_id) {
          // For non-order transactions where the user is both performer and subject
          customerName = performedByName;
          customerEmail = performedByUser?.email || 'No email';
        }
        
        return {
          id: transaction.id,
          productId: transaction.items.inventory.id,
          productName: transaction.items.inventory.name,
          quantity: 1, // Each transaction is for one item
          type: transaction.transaction_type === 'sale' ? 'out' : 'in',
          reason: transaction.notes || transaction.transaction_type,
          performedBy: performedByName,
          timestamp: new Date(transaction.created_at),
          userId: transaction.user_id,
          userName: performedByName,
          userRole: performedByRole,
          serialId: transaction.item_serial,
          orderNumber: transaction.orders?.order_number,
          customerName: customerName,
          customerEmail: customerEmail
        };
      }) as InventoryMovement[];

      console.log('Final movements data:', movements);
      return movements;
    },
  });

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || product.category === filterCategory)
  );

  return {
    products,
    inventoryMovements,
    categories,
    filteredProducts,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    isLoading,
    error
  };
};
