
/**
 * Gets products for store and products pages by mapping inventory data
 * to the Product interface
 */
export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching products from database...');
  
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product_types (name),
        price (amount, effective_from, effective_to, status)
      `);

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    console.log('Raw products data:', data);
    
    if (!data || data.length === 0) {
      console.log('No products found in database');
      return [];
    }

    // Map the database response to our Product interface
    const products = data.map(inv => {
      // Sort prices by effective_from date (descending) and take the first valid one
      const prices = inv.price || [];
      
      // Log prices for debugging
      console.log(`Product ${inv.name} has ${prices.length} prices:`, prices);
      
      // Find active and valid price (status=true and not expired)
      let currentPrice = 0;
      if (prices.length > 0) {
        // Filter for active prices
        const activePrices = prices.filter((p: any) => 
          p.status === true && 
          (!p.effective_to || new Date(p.effective_to) > new Date())
        );
        
        console.log(`Product ${inv.name} has ${activePrices.length} active prices`);
        
        // Sort by effective_from date (newest first)
        if (activePrices.length > 0) {
          activePrices.sort((a: any, b: any) => 
            new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime()
          );
          currentPrice = activePrices[0].amount;
        }
      }

      console.log(`Product ${inv.name} final price: ${currentPrice}`);

      // Return product object with formatted data
      return {
        id: inv.id,
        name: inv.name,
        description: inv.description || '',
        price: currentPrice,
        stock: inv.quantity || 0, 
        image: '', // You might want to add images later
        category: inv.product_types?.name || 'Uncategorized',
        location: '', // You might want to add location data later
        createdAt: new Date(inv.created_at || Date.now()),
        updatedAt: new Date(inv.updated_at || Date.now())
      } as Product;
    });

    console.log('Transformed products:', products);
    return products;
  } catch (error) {
    console.error('Unexpected error in getProducts:', error);
    throw error;
  }
};
