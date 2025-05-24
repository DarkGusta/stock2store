import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

/**
 * Gets products for inventory management with proper price fetching using JOIN
 */
export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching products from database...');
  
  try {
    // Use a more explicit JOIN approach to get inventory with current active prices
    const { data: inventoryWithPrices, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        id,
        name,
        description,
        quantity,
        created_at,
        updated_at,
        product_type_id,
        price!inner(
          amount,
          status,
          effective_from
        )
      `)
      .eq('price.status', true);
      
    if (inventoryError) {
      console.error('Error fetching inventory with prices:', inventoryError);
      
      // Fallback: try the alternative method if the JOIN fails
      console.log('Trying alternative method...');
      return await getProductsAlternative();
    }
    
    console.log('Inventory with prices data:', inventoryWithPrices);
    
    if (!inventoryWithPrices || inventoryWithPrices.length === 0) {
      console.log('No inventory data found with JOIN, trying alternative method...');
      return await getProductsAlternative();
    }
    
    // Get all product types
    const { data: productTypes, error: typesError } = await supabase
      .from('product_types')
      .select('*');
      
    if (typesError) {
      console.error('Error fetching product types:', typesError);
    }
    
    console.log('Product types:', productTypes);
    
    // Create a map of product types for quick lookup
    const typeMap = new Map();
    if (productTypes) {
      productTypes.forEach((type: any) => {
        typeMap.set(type.id, type.name);
      });
    }
    
    // Map inventory data to products with joined prices
    const products = inventoryWithPrices.map((item: any) => {
      // Get the most recent active price (sort by effective_from if multiple prices exist)
      let currentPrice = 0;
      if (Array.isArray(item.price) && item.price.length > 0) {
        // Sort prices by effective_from to get the most recent
        const sortedPrices = item.price.sort((a: any, b: any) => 
          new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
        );
        currentPrice = sortedPrices[0].amount;
      }
      
      console.log(`Product ${item.name} - Price data:`, item.price, 'Current price:', currentPrice);
      
      return {
        id: item.id || '',
        name: item.name || 'Unnamed Product',
        description: item.description || '',
        price: currentPrice,
        stock: item.quantity || 0,
        image: '',
        category: typeMap.get(item.product_type_id) || 'Uncategorized',
        location: '',
        barcode: '',
        createdAt: new Date(item.created_at || Date.now()),
        updatedAt: new Date(item.updated_at || Date.now())
      };
    });
    
    console.log('Final products with joined prices:', products);
    return products;
  } catch (error) {
    console.error('Error in getProducts method:', error);
    console.log('Falling back to alternative method...');
    return await getProductsAlternative();
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
      .eq('status', true)
      .order('effective_from', { ascending: false });
      
    if (priceError) {
      console.error('Error fetching prices:', priceError);
    }
    
    console.log('Price data fetched:', priceData);
    
    // Create a map of prices for quick lookup (get the most recent active price)
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
