
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WarehouseOverview from '@/components/warehouse/WarehouseOverview';
import LowStockAlert from '@/components/warehouse/LowStockAlert';
import InventoryMovementsTable from '@/components/warehouse/InventoryMovementsTable';
import ShelfMapping from '@/components/warehouse/ShelfMapping';
import RefundRequestsTab from '@/components/warehouse/RefundRequestsTab';
import ItemStatusManager from '@/components/inventory/ItemStatusManager';
import PendingOrdersTab from '@/components/warehouse/PendingOrdersTab';
import WarehouseHeader from '@/components/warehouse/WarehouseHeader';
import WarehouseFilters from '@/components/warehouse/WarehouseFilters';
import InventoryGrid from '@/components/warehouse/InventoryGrid';
import { useWarehouseData } from '@/hooks/useWarehouseData';
import { Product } from '@/types';

const Warehouse = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    products,
    inventoryMovements,
    categories,
    filteredProducts,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    isLoading,
    error
  } = useWarehouseData();

  const handleProductSelect = (product: Product) => {
    console.log('Product selected:', product);
  };

  const handleViewAllInventory = () => {
    setActiveTab('inventory');
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading warehouse data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading warehouse data: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <WarehouseHeader categories={categories} />

      {/* Search and Filters */}
      <WarehouseFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
      />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Order Requests</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="refunds">Refund Requests</TabsTrigger>
          <TabsTrigger value="item-status">Item Status</TabsTrigger>
          <TabsTrigger value="shelf">Shelf Mapping</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <WarehouseOverview products={products} inventoryMovements={inventoryMovements} />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <PendingOrdersTab />
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <InventoryGrid products={filteredProducts} />
        </TabsContent>
        
        <TabsContent value="movements" className="space-y-4">
          <InventoryMovementsTable movements={inventoryMovements} getProductById={getProductById} />
        </TabsContent>
        
        <TabsContent value="refunds" className="space-y-4">
          <RefundRequestsTab />
        </TabsContent>
        
        <TabsContent value="item-status" className="space-y-4">
          <ItemStatusManager />
        </TabsContent>
        
        <TabsContent value="shelf" className="space-y-4">
          <ShelfMapping products={products} onProductSelect={handleProductSelect} />
        </TabsContent>
      </Tabs>

      {/* Low Stock Alerts */}
      <LowStockAlert 
        products={products} 
        onProductSelect={handleProductSelect} 
        onViewAllInventory={handleViewAllInventory} 
      />
    </div>
  );
};

export default Warehouse;
