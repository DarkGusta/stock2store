
import React, { useState } from 'react';
import { Search, ShoppingCart, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainLayout from '@/components/layout/MainLayout';
import { products } from '@/utils/mockData';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/types';

const Store = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // Changed from empty string to 'all'
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cartItems, setCartItems] = useState<{product: Product, quantity: number}[]>([]);
  const { toast } = useToast();

  // Get unique categories from products
  const categories = [...new Set(products.map(product => product.category))];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter; // Changed from empty string to 'all'
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'newest':
        return b.createdAt.getTime() - a.createdAt.getTime();
      default:
        return 0;
    }
  });

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevItems, { product, quantity: 1 }];
      }
    });
    
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart.`,
    });
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Store</h1>
            <p className="text-gray-500">Shop our products</p>
          </div>
          <div className="flex items-center">
            <Button variant="outline" className="mr-2 relative">
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.2rem] h-5">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
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
              <SelectItem value="all">All Categories</SelectItem> {/* Changed value from empty string to 'all' */}
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className={`rounded-r-none ${viewMode === 'grid' ? '' : 'border-r'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className={`rounded-l-none ${viewMode === 'list' ? '' : 'border-l'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </Button>
          </div>
        </div>

        {/* Product count */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">{sortedProducts.length}</span> products
          </p>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="h-48 relative bg-gray-100">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="object-cover w-full h-full"
                  />
                </div>
                
                <CardContent className="pt-4">
                  <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold">{formatPrice(product.price)}</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      In Stock
                    </Badge>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t p-4 bg-gray-50">
                  <Button 
                    className="w-full"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-40 h-40 bg-gray-100">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  
                  <div className="flex-grow p-4 flex flex-col">
                    <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{product.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <div>
                        <span className="font-semibold text-lg">{formatPrice(product.price)}</span>
                        <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                          In Stock
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {sortedProducts.length === 0 && (
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
                setCategoryFilter('all'); // Changed from empty string to 'all'
              }}
            >
              Reset filters
            </Button>
          </div>
        )}

        {/* Shopping Cart Overlay - Fixed at bottom */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 z-40">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center">
                <ShoppingCart size={20} className="mr-2" />
                <span>
                  <span className="font-bold">{cartItemsCount}</span> items - 
                  <span className="font-bold ml-1">{formatPrice(cartTotal)}</span>
                </span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-initial" onClick={() => setCartItems([])}>
                  Clear Cart
                </Button>
                <Button className="flex-1 sm:flex-initial">
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Store;
