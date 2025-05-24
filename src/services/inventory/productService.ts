import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

/**
 * Gets products for inventory management with proper price fetching
 */
export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching products from database...');
  
  try {
    // First get all inventory items
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        id, 
        name, 
        description, 
        quantity, 
        created_at, 
        updated_at, 
        product_type_id
      `);
      
    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError);
      throw inventoryError;
    }
    
    console.log('Inventory data:', inventoryData);
    
    if (!inventoryData || inventoryData.length === 0) {
      console.log('No inventory data found');
      return [];
    }
    
    // Get all product types
    const { data: productTypes, error: typesError } = await supabase
      .from('product_types')
      .select('id, name');
      
    if (typesError) {
      console.error('Error fetching product types:', typesError);
    }
    
    // Create a map of product types for quick lookup
    const typeMap = new Map();
    if (productTypes) {
      productTypes.forEach((type: any) => {
        typeMap.set(type.id, type.name);
      });
    }
    
    // Get ALL price records first to debug
    console.log('Fetching ALL price records for debugging...');
    const { data: allPrices, error: allPricesError } = await supabase
      .from('price')
      .select('*');
    
    console.log('All price records in database:', allPrices);
    
    if (allPricesError) {
      console.error('Error fetching all prices:', allPricesError);
    }
    
    // Get current active prices for all inventory items
    const inventoryIds = inventoryData.map(item => item.id);
    console.log('Fetching prices for inventory IDs:', inventoryIds);
    
    const { data: priceData, error: priceError } = await supabase
      .from('price')
      .select('inventory_id, amount, effective_from, status')
      .in('inventory_id', inventoryIds)
      .eq('status', true);
      
    if (priceError) {
      console.error('Error fetching prices:', priceError);
    }
    
    console.log('Filtered price data fetched:', priceData);
    
    // Try without status filter to see if that's the issue
    const { data: priceDataNoFilter, error: priceErrorNoFilter } = await supabase
      .from('price')
      .select('inventory_id, amount, effective_from, status')
      .in('inventory_id', inventoryIds);
      
    console.log('Price data without status filter:', priceDataNoFilter);
    
    // Create a map of prices for quick lookup (get the most recent price)
    const priceMap = new Map();
    const finalPriceData = priceData && priceData.length > 0 ? priceData : priceDataNoFilter;
    
    if (finalPriceData) {
      // Sort by effective_from to get the most recent price for each inventory item
      const sortedPrices = finalPriceData.sort((a: any, b: any) => 
        new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
      );
      
      sortedPrices.forEach((price: any) => {
        if (!priceMap.has(price.inventory_id)) {
          priceMap.set(price.inventory_id, price.amount);
          console.log(`Setting price for inventory ${price.inventory_id}: $${price.amount} (status: ${price.status})`);
        }
      });
    }
    
    console.log('Price map created:', Array.from(priceMap.entries()));
    
    // Map inventory data to products
    const products = inventoryData.map((item: any) => {
      const price = priceMap.get(item.id) || 0;
      console.log(`Product ${item.name} (ID: ${item.id}) - Price: $${price}`);
      
      return {
        id: item.id || '',
        name: item.name || 'Unnamed Product',
        description: item.description || '',
        price: price,
        stock: item.quantity || 0,
        image: '',
        category: typeMap.get(item.product_type_id) || 'Uncategorized',
        location: '',
        barcode: '',
        createdAt: new Date(item.created_at || Date.now()),
        updatedAt: new Date(item.updated_at || Date.now())
      };
    });
    
    console.log('Final products with prices:', products);
    return products;
  } catch (error) {
    console.error('Error in getProducts method:', error);
    throw error;
  }
};

/**
 * Alternative method to get products that fetches inventory and items separately
 */
export const getProductsAlternative = async (): Promise<Product[]> => {
  console.log('Using alternative method to fetch products...');
  
  try {
    // First get all inventory items
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        id, 
        name, 
        description, 
        quantity, 
        created_at, 
        updated_at, 
        product_type_id
      `);
      
    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError);
      throw inventoryError;
    }
    
    console.log('Inventory data:', inventoryData);
    
    if (!inventoryData || inventoryData.length === 0) {
      console.log('No inventory data found');
      return [];
    }
    
    // Get all product types
    const { data: productTypes, error: typesError } = await supabase
      .from('product_types')
      .select('id, name');
      
    if (typesError) {
      console.error('Error fetching product types:', typesError);
    }
    
    // Create a map of product types for quick lookup
    const typeMap = new Map();
    if (productTypes) {
      productTypes.forEach((type: any) => {
        typeMap.set(type.id, type.name);
      });
    }
    
    // Get current active prices for all inventory items
    const inventoryIds = inventoryData.map(item => item.id);
    console.log('Fetching prices for inventory IDs:', inventoryIds);
    
    const { data: priceData, error: priceError } = await supabase
      .from('price')
      .select('inventory_id, amount, effective_from, status')
      .in('inventory_id', inventoryIds)
      .eq('status', true);
      
    if (priceError) {
      console.error('Error fetching prices:', priceError);
    }
    
    console.log('Filtered price data fetched:', priceData);
    
    // Create a map of prices for quick lookup (get the most recent price)
    const priceMap = new Map();
    if (priceData) {
      priceData.forEach((price: any) => {
        if (!priceMap.has(price.inventory_id)) {
          priceMap.set(price.inventory_id, price.amount);
          console.log(`Setting price for inventory ${price.inventory_id}: $${price.amount}`);
        }
      });
    }
    
    console.log('Price map created:', Array.from(priceMap.entries()));
    
    // Map inventory data to products
    const products = inventoryData.map((item: any) => {
      const price = priceMap.get(item.id) || 0;
      console.log(`Product ${item.name} (ID: ${item.id}) - Price: $${price}`);
      
      return {
        id: item.id || '',
        name: item.name || 'Unnamed Product',
        description: item.description || '',
        price: price,
        stock: item.quantity || 0,
        image: '',
        category: typeMap.get(item.product_type_id) || 'Uncategorized',
        location: '',
        barcode: '',
        createdAt: new Date(item.created_at || Date.now()),
        updatedAt: new Date(item.updated_at || Date.now())
      };
    });
    
    console.log('Products from alternative method:', products);
    return products;
  } catch (error) {
    console.error('Error in alternative getProducts method:', error);
    throw error;
  }
};

/**
 * Create a new product in the inventory
 */
export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  try {
    console.log('Creating new product:', product);
    
    // First, check if the product category exists or create it
    let productTypeId;
    
    if (product.category) {
      // Try to find the category
      const { data: existingTypes } = await supabase
        .from('product_types')
        .select('id')
        .eq('name', product.category)
        .limit(1);
      
      if (existingTypes && existingTypes.length > 0) {
        productTypeId = existingTypes[0].id;
      } else {
        // Create new product type
        const { data: newType, error: typeError } = await supabase
          .from('product_types')
          .insert({ 
            name: product.category,
            tax_type: 0.0 // Default tax type
          })
          .select('id')
          .single();
        
        if (typeError) {
          console.error('Error creating product type:', typeError);
          throw typeError;
        }
        
        productTypeId = newType.id;
      }
    }
    
    // Create inventory item
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('inventory')
      .insert({
        name: product.name,
        description: product.description,
        quantity: product.stock,
        product_type_id: productTypeId
      })
      .select('*')
      .single();
    
    if (inventoryError) {
      console.error('Error creating inventory item:', inventoryError);
      throw inventoryError;
    }
    
    // If price is provided, create a price record
    if (product.price) {
      const { error: priceError } = await supabase
        .from('price')
        .insert({
          inventory_id: inventoryItem.id,
          amount: product.price,
          status: true
        });
      
      if (priceError) {
        console.error('Error creating price:', priceError);
        // Continue anyway, we have the inventory item
      }
    }
    
    // Return the new product
    return {
      id: inventoryItem.id,
      name: inventoryItem.name,
      description: inventoryItem.description || '',
      price: product.price || 0,
      stock: inventoryItem.quantity,
      image: '',
      category: product.category || 'Uncategorized',
      location: '',
      barcode: product.barcode || '',
      createdAt: new Date(inventoryItem.created_at),
      updatedAt: new Date(inventoryItem.updated_at)
    };
    
  } catch (error) {
    console.error('Error in createProduct:', error);
    return null;
  }
};
