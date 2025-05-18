
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import { SearchIcon, ShoppingCart, PackageOpen } from "lucide-react";
import { Product } from '@/types';
import { getProducts } from '@/services/databaseService';
import ProductCard from '@/components/products/ProductCard';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';

const Store: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch products using React Query
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['store-products'],
    queryFn: getProducts,
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error in Store page:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Get all unique categories
  const categories = ['all', ...Array.from(new Set(products.map(product => product.category || 'Uncategorized')))];

  // Filter products by search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory && product.stock > 0; // Only show products in stock
  });

  const handleProductSelect = (product: Product) => {
    toast({
      title: "Product Added",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to the Store{user ? `, ${user.name}` : ''}</h1>
          <p className="text-gray-500 mt-1">Browse our available products</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button onClick={() => refetch()} variant="outline">
            Refresh Products
          </Button>
          <Button>
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Cart (0)
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <Card>
          <CardContent className="pt-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1 md:col-span-2 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Filter:</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge 
                      key={category}
                      variant={categoryFilter === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setCategoryFilter(category)}
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="inline-flex items-center justify-center bg-blue-100 p-3 rounded-full mb-4">
                <PackageOpen size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">No products available</h3>
              <p className="text-gray-500 mt-1">
                There are currently no products in the database.
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  showActions={false}
                  onSelect={handleProductSelect}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="inline-flex items-center justify-center bg-blue-100 p-3 rounded-full mb-4">
                <SearchIcon size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Store;
