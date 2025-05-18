
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Inventory,
  ProductType, 
  Item,
  Location,
  Order, 
  OrderItem, 
  DamageReport,
  Transaction
} from "@/types";

// User related operations
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data as User;
};

// Products and Inventory operations
export const getProductTypes = async () => {
  const { data, error } = await supabase
    .from('product_types')
    .select('*');
    
  if (error) throw error;
  return data as ProductType[];
};

export const getInventoryItems = async () => {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      product_types (name, tax_type),
      price (amount, effective_from)
    `);
    
  if (error) throw error;
  return data as (Inventory & { product_types: Pick<ProductType, 'name' | 'taxType'>, price: { amount: number, effective_from: Date }[] })[];
};

export const getInventoryItem = async (id: string) => {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      product_types (name, tax_type),
      price (amount, effective_from)
    `)
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data as (Inventory & { product_types: Pick<ProductType, 'name' | 'taxType'>, price: { amount: number, effective_from: Date }[] });
};

// Items operations
export const getItems = async () => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      inventory (name),
      locations (shelf_number, slot_number),
      price (amount)
    `);
    
  if (error) throw error;
  return data as (Item & { inventory: Pick<Inventory, 'name'>, locations: Pick<Location, 'shelfNumber' | 'slotNumber'>, price: Pick<{ amount: number }, 'amount'> })[];
};

export const getItem = async (serialId: string) => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      inventory (name, description),
      locations (shelf_number, slot_number)
    `)
    .eq('serial_id', serialId)
    .single();
    
  if (error) throw error;
  return data;
};

// Orders operations
export const getOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (name)
    `);
    
  if (error) throw error;
  return data as (Order & { profiles: Pick<User, 'name'> })[];
};

export const getOrderItems = async (orderId: string) => {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      *,
      items (
        serial_id,
        inventory (name)
      )
    `)
    .eq('order_id', orderId);
    
  if (error) throw error;
  return data as (OrderItem & { items: { serial_id: string, inventory: Pick<Inventory, 'name'> } })[];
};

// Transactions operations
export const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      profiles (name),
      source:locations!source_location_id (shelf_number, slot_number),
      destination:locations!destination_location_id (shelf_number, slot_number)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data as Transaction[];
};

// Damage Reports operations
export const getDamageReports = async () => {
  const { data, error } = await supabase
    .from('damage_reports')
    .select(`
      *,
      items (
        serial_id,
        inventory (name)
      ),
      reporter:profiles (name)
    `);
    
  if (error) throw error;
  return data as DamageReport[];
};

// Locations operations
export const getLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select('*');
    
  if (error) throw error;
  return data as Location[];
};

// Dashboard statistics
export const getDashboardStats = async (): Promise<{ 
  totalProducts: number; 
  totalStock: number;
  lowStockProducts: number;
  ordersPending: number;
}> => {
  const [
    { count: totalProducts },
    { data: inventoryItems },
    { count: lowStockProducts },
    { count: ordersPending }
  ] = await Promise.all([
    supabase.from('inventory').select('*', { count: 'exact', head: true }),
    supabase.from('inventory').select('quantity'),
    supabase.from('inventory').select('*', { count: 'exact', head: true }).lt('quantity', 10),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  ]);

  const totalStock = inventoryItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return {
    totalProducts: totalProducts || 0,
    totalStock,
    lowStockProducts: lowStockProducts || 0,
    ordersPending: ordersPending || 0
  };
};
