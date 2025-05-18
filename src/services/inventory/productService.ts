
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

/**
 * Gets products for inventory management
 */
export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching products from database...');
  
  try {
    // Try the alternative method as it seems more reliable
    return await getProductsAlternative();
  } catch (error) {
    console.error('Alternative method failed, trying original method:', error);
    
    try {
      // Fallback to original method
      // Fetch inventory items with their related data
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          name,
          description,
          quantity,
          created_at,
          updated_at,
          product_types (id, name),
          price (amount, effective_from, status)
        `);

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Raw products data:', data);
      
      if (!data || data.length === 0) {
        console.log('No products found in database');
        
        // Let's try a simpler query to see if there's any data at all
        const { data: inventoryOnly, error: inventoryError } = await supabase
          .from('inventory')
          .select('*');
          
        if (inventoryError) {
          console.error('Error fetching basic inventory:', inventoryError);
        } else {
          console.log('Basic inventory check:', inventoryOnly);
        }
        
        return [];
      }

      // Map the database response to our Product interface
      const products = data.map(item => {
        // Find the current active price
        const prices = Array.isArray(item.price) ? item.price : [];
        let currentPrice = 0;
        
        // Filter for active prices
        const activePrices = prices.filter((p: any) => p && p.status === true);
        
        if (activePrices.length > 0) {
          // Sort by effective_from date (newest first) and take the first one
          activePrices.sort((a: any, b: any) => 
            new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
          );
          currentPrice = activePrices[0]?.amount || 0;
        }

        return {
          id: item.id || '',
          name: item.name || 'Unnamed Product',
          description: item.description || '',
          price: currentPrice || 0,
          stock: item.quantity || 0, 
          image: '', // No images yet in the database
          category: item.product_types?.name || 'Uncategorized',
          location: '', // Location data is not yet available
          barcode: '', // Barcode not available yet
          createdAt: new Date(item.created_at || Date.now()),
          updatedAt: new Date(item.updated_at || Date.now())
        };
      });

      console.log('Transformed products:', products);
      return products;
    } catch (secondError) {
      console.error('Both product fetching methods failed:', secondError);
      return [];
    }
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
      // Let's check if the inventory table exists by describing it
      console.log('No inventory data found. Checking if table exists...');
      
      // Let's also check product_types to see if that has data
      const { data: productTypes, error: typesError } = await supabase
        .from('product_types')
        .select('*');
        
      if (typesError) {
        console.error('Error checking product_types:', typesError);
      } else {
        console.log('Product types data:', productTypes);
      }
      
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
    
    // Get prices for all inventory items
    const { data: priceData, error: priceError } = await supabase
      .from('price')
      .select('inventory_id, amount, effective_from, status')
      .eq('status', true);
      
    if (priceError) {
      console.error('Error fetching prices:', priceError);
    }
    
    // Create a map of prices for quick lookup
    const priceMap = new Map();
    if (priceData) {
      priceData.forEach((price: any) => {
        if (!priceMap.has(price.inventory_id) || 
            new Date(price.effective_from) > new Date(priceMap.get(price.inventory_id).effective_from)) {
          priceMap.set(price.inventory_id, price);
        }
      });
    }
    
    // Map inventory data to products
    const products = inventoryData.map((item: any) => ({
      id: item.id || '',
      name: item.name || 'Unnamed Product',
      description: item.description || '',
      price: (priceMap.get(item.id)?.amount) || 0,
      stock: item.quantity || 0,
      image: '',
      category: typeMap.get(item.product_type_id) || 'Uncategorized',
      location: '',
      barcode: '',
      createdAt: new Date(item.created_at || Date.now()),
      updatedAt: new Date(item.updated_at || Date.now())
    }));
    
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
