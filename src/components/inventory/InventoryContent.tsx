
import React, { useState } from 'react';
import { Package, Plus, RefreshCw, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProductCard from '@/components/products/ProductCard';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { getProducts } from '@/services/inventory/productService';
import { useQuery } from '@tanstack/react-query';
import InventoryHeader from './InventoryHeader';
import InventoryFilters from './InventoryFilters';
import InventoryEmptyState from './InventoryEmptyState';
import InventoryListView from './InventoryListView';
import InventoryGridView from './InventoryGridView';

const InventoryContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  // Fetch products using React Query
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: getProducts,
    retry: false
  });

  // Log products for debugging
  console.log('Products in Inventory component:', products);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      console.error('Error in Inventory page:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Get unique categories from products
  const categories = [...new Set(products.map(product => product.category || 'Uncategorized'))];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'stock-asc':
        return a.stock - b.stock;
      case 'stock-desc':
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  const handleProductEdit = (id: string) => {
    toast({
      title: "Edit Product",
      description: `Editing product with ID: ${id}`,
    });
  };

  const handleProductDelete = (id: string) => {
    toast({
      title: "Delete Product",
      description: `Deleting product with ID: ${id}`,
      variant: "destructive",
    });
  };

  const handleProductSelect = (product: Product) => {
    toast({
      title: "Product Selected",
      description: `Viewing details for: ${product.name}`,
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Products",
      description: "Fetching the latest product data from the database.",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <InventoryHeader onRefresh={handleRefresh} />
      
      <InventoryFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
      />

      {/* Product count and export */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium">{sortedProducts.length}</span> products
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Products Display with loading state */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <InventoryEmptyState />
          ) : sortedProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <InventoryGridView 
                products={sortedProducts} 
                onEdit={handleProductEdit} 
                onDelete={handleProductDelete} 
                onSelect={handleProductSelect}
              />
            ) : (
              <InventoryListView 
                products={sortedProducts}
                onEdit={handleProductEdit}
                onDelete={handleProductDelete}
                formatPrice={formatPrice}
              />
            )
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="inline-flex items-center justify-center bg-blue-100 p-3 rounded-full mb-4">
                <Search size={24} className="text-blue-600" />
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

export default InventoryContent;
