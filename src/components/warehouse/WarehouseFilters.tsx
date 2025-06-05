
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface WarehouseFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  categories: string[];
}

const WarehouseFilters: React.FC<WarehouseFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  categories
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input
        type="search"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="md:col-span-2 flex items-center space-x-4">
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <Button variant="outline">
          <Filter size={16} className="mr-2" />
          Filter
        </Button>
      </div>
    </div>
  );
};

export default WarehouseFilters;
