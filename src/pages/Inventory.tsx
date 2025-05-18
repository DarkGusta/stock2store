
import React, { useState } from 'react';
import { 
  Plus, Search, RefreshCw, Download, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/types';
import { getProducts } from '@/services/databaseService';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  // Fetch products using React Query
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: getProducts,
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Inventory Management</h1>
          <p className="text-gray-500">Manage and update your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" size={18} />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Name (A-Z)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="price-asc">Price (Low-High)</SelectItem>
            <SelectItem value="price-desc">Price (High-Low)</SelectItem>
            <SelectItem value="stock-asc">Stock (Low-High)</SelectItem>
            <SelectItem value="stock-desc">Stock (High-Low)</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={() => {
          setSearchTerm('');
          setCategoryFilter('all');
          setSortBy('name-asc');
        }}>
          <RefreshCw size={16} className="mr-2" />
          Reset
        </Button>
      </div>

      {/* Product count and export */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium">{sortedProducts.length}</span> products
        </p>
        <Button variant="outline" size="sm">
          <Download size={16} className="mr-2" />
          Export
        </Button>
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
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="inline-flex items-center justify-center bg-blue-100 p-3 rounded-full mb-4">
                <Package size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">No products available</h3>
              <p className="text-gray-500 mt-1">
                There are currently no products in the database.
              </p>
              <Button 
                className="mt-4"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : sortedProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onEdit={handleProductEdit}
                    onDelete={handleProductDelete}
                    onSelect={handleProductSelect}
                  />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleProductEdit(product.id)}>
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600" 
                          onClick={() => handleProductDelete(product.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

const InventoryPage = () => (
  <MainLayout>
    <Inventory />
  </MainLayout>
);

export default InventoryPage;
