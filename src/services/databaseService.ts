
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  ProductType, 
  Inventory, 
  Item, 
  Order, 
  OrderItem, 
  Transaction, 
  DamageReport, 
  Location 
} from '@/types';

/**
 * Gets all users from the database
 */
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) throw error;
  
  return data.map(user => ({
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    role: user.role,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
  } as User));
};

/**
 * Gets all product types from the database
 */
export const getProductTypes = async () => {
  const { data, error } = await supabase
    .from('product_types')
    .select('*');
  
  if (error) throw error;
  
  return data.map(pt => ({
    id: pt.id,
    name: pt.name,
    description: pt.description,
    taxType: pt.tax_type,
  } as ProductType));
};

/**
 * Gets all inventory items with their product type and price info
 */
export const getInventory = async () => {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      product_types (name, tax_type),
      price (amount, effective_from)
    `);
  
  if (error) throw error;
  
  return data.map(inv => ({
    id: inv.id,
    name: inv.name,
    description: inv.description,
    productTypeId: inv.product_type_id,
    quantity: inv.quantity,
    status: inv.status,
    createdAt: new Date(inv.created_at),
    updatedAt: new Date(inv.updated_at),
    product_types: {
      name: inv.product_types.name,
      taxType: inv.product_types.tax_type
    },
    price: inv.price.map((p: any) => ({
      amount: p.amount,
      effective_from: new Date(p.effective_from)
    }))
  } as Inventory & { 
    product_types: Pick<ProductType, "name" | "taxType">;
    price: { amount: number; effective_from: Date; }[];
  }));
};

/**
 * Gets inventory items with location and price info
 */
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
  
  return data.map(item => ({
    serialId: item.serial_id,
    inventoryId: item.inventory_id,
    locationId: item.location_id,
    priceId: item.price_id,
    status: item.status,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    inventory: {
      name: item.inventory.name
    },
    locations: item.locations ? {
      shelfNumber: item.locations.shelf_number,
      slotNumber: item.locations.slot_number
    } : null,
    price: item.price ? {
      amount: item.price.amount
    } : null
  } as Item & { 
    inventory: Pick<Inventory, "name">;
    locations: Pick<Location, "shelfNumber" | "slotNumber"> | null;
    price: Pick<{ amount: number }, "amount"> | null;
  }));
};

/**
 * Gets all orders with customer info
 */
export const getOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (name)
    `);
  
  if (error) throw error;
  
  return data.map(order => ({
    id: order.id,
    userId: order.user_id,
    orderNumber: order.order_number,
    status: order.status,
    totalAmount: order.total_amount,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
    profiles: {
      name: order.profiles.name
    }
  } as Order & { 
    profiles: Pick<User, "name">;
  }));
};

/**
 * Gets order items with product info
 */
export const getOrderItems = async () => {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      *,
      items (serial_id, inventory (name))
    `);
  
  if (error) throw error;
  
  return data.map(item => ({
    id: item.id,
    orderId: item.order_id,
    itemSerial: item.item_serial,
    price: item.price,
    items: {
      serial_id: item.items.serial_id,
      inventory: {
        name: item.items.inventory.name
      }
    }
  } as OrderItem & { 
    items: { 
      serial_id: string; 
      inventory: Pick<Inventory, "name">; 
    };
  }));
};

/**
 * Gets all transactions with user, location info
 */
export const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      profiles (name),
      source:source_location_id (shelf_number, slot_number),
      destination:destination_location_id (shelf_number, slot_number)
    `);
  
  if (error) throw error;
  
  return data.map(tx => ({
    id: tx.id,
    itemSerial: tx.item_serial,
    userId: tx.user_id,
    sourceLocationId: tx.source_location_id,
    destinationLocationId: tx.destination_location_id,
    transactionType: tx.transaction_type,
    orderId: tx.order_id,
    damageReportId: tx.damage_report_id,
    notes: tx.notes,
    createdAt: new Date(tx.created_at)
  } as Transaction));
};

/**
 * Gets damage reports with item and reporter info
 */
export const getDamageReports = async () => {
  const { data, error } = await supabase
    .from('damage_reports')
    .select(`
      *,
      items (serial_id, inventory (name)),
      reporter:reporter_id (name)
    `);
  
  if (error) throw error;
  
  return data.map(report => ({
    id: report.id,
    itemSerial: report.item_serial,
    reporterId: report.reporter_id,
    description: report.description,
    photoUrl: report.photo_url,
    status: report.status,
    reportedAt: new Date(report.reported_at)
  } as DamageReport));
};

/**
 * Gets all warehouse locations
 */
export const getLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select('*');
  
  if (error) throw error;
  
  return data.map(loc => ({
    id: loc.id,
    shelfNumber: loc.shelf_number,
    slotNumber: loc.slot_number,
    status: loc.status,
    capacity: loc.capacity
  } as Location));
};
