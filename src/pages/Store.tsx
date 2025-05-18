
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Product } from '@/types';
import { getInventory } from '@/services/databaseService';

const Store: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const inventoryData = await getInventory();
        // Map the inventory data to the Product type
        const productsData: Product[] = inventoryData.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price[0]?.amount || 0, // Assuming the first price is the current price
          stock: item.quantity,
          image: '', // You might need to fetch images separately
          barcode: '', // Barcode info might be in items table
          location: '', // Location info might be in items table
          category: item.product_types.name,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      }
    };

    fetchInventory();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Store</CardTitle>
          <CardDescription>Browse available products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Products</Label>
            <Input
              type="text"
              id="search"
              placeholder="Enter product name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="border rounded-md p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-500">{product.description}</p>
                <p className="mt-2">Price: ${product.price}</p>
                <p>Stock: {product.stock}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Store;
