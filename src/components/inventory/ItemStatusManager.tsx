
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDetailedInventory, updateItemStatus, getItemStatusCounts } from '@/services/inventory/inventoryService';
import { supabase } from '@/integrations/supabase/client';

const ItemStatusManager = () => {
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [statusChanges, setStatusChanges] = useState<{ [key: string]: string }>({});
  const [reasons, setReasons] = useState<{ [key: string]: string }>({});
  const [bulkSelectedItems, setBulkSelectedItems] = useState<{ [key: string]: string[] }>({});
  const [bulkStatusChanges, setBulkStatusChanges] = useState<{ [key: string]: string }>({});
  const [bulkReasons, setBulkReasons] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventoryItems = [], isLoading, refetch } = useQuery({
    queryKey: ['detailed-inventory'],
    queryFn: getDetailedInventory,
  });

  const handleStatusChange = async (serialId: string, newStatus: string) => {
    try {
      setUpdatingItem(serialId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const reason = reasons[serialId] || undefined;
      const success = await updateItemStatus(serialId, newStatus as any, user.id, reason);
      
      if (success) {
        toast({
          title: 'Status Updated',
          description: `Item ${serialId} status updated to ${newStatus}`,
        });

        // Clear the status change and reason
        setStatusChanges(prev => {
          const updated = { ...prev };
          delete updated[serialId];
          return updated;
        });
        setReasons(prev => {
          const updated = { ...prev };
          delete updated[serialId];
          return updated;
        });

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['detailed-inventory'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
        queryClient.invalidateQueries({ queryKey: ['warehouse-products'] });
      } else {
        throw new Error('Failed to update item status');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update item status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleBulkStatusChange = async (inventoryId: string) => {
    const selectedItems = bulkSelectedItems[inventoryId] || [];
    const newStatus = bulkStatusChanges[inventoryId];
    const reason = bulkReasons[inventoryId];

    if (selectedItems.length === 0 || !newStatus) {
      toast({
        title: 'Error',
        description: 'Please select items and a new status',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUpdatingItem(inventoryId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update each selected item
      const updatePromises = selectedItems.map(serialId => 
        updateItemStatus(serialId, newStatus as any, user.id, reason)
      );

      const results = await Promise.all(updatePromises);
      const successCount = results.filter(Boolean).length;

      if (successCount === selectedItems.length) {
        toast({
          title: 'Bulk Status Update Complete',
          description: `Updated ${successCount} items to ${newStatus}`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `Updated ${successCount} out of ${selectedItems.length} items`,
          variant: 'destructive',
        });
      }

      // Clear bulk selections
      setBulkSelectedItems(prev => ({ ...prev, [inventoryId]: [] }));
      setBulkStatusChanges(prev => {
        const updated = { ...prev };
        delete updated[inventoryId];
        return updated;
      });
      setBulkReasons(prev => {
        const updated = { ...prev };
        delete updated[inventoryId];
        return updated;
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['detailed-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-products'] });

    } catch (error) {
      console.error('Error updating bulk item status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update item statuses',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleBulkItemSelection = (inventoryId: string, serialId: string, checked: boolean) => {
    setBulkSelectedItems(prev => {
      const currentSelected = prev[inventoryId] || [];
      if (checked) {
        return { ...prev, [inventoryId]: [...currentSelected, serialId] };
      } else {
        return { ...prev, [inventoryId]: currentSelected.filter(id => id !== serialId) };
      }
    });
  };

  const handleSelectAllItems = (inventoryId: string, items: any[], checked: boolean) => {
    const selectableItems = items.filter(item => item.status !== 'sold');
    if (checked) {
      setBulkSelectedItems(prev => ({
        ...prev,
        [inventoryId]: selectableItems.map(item => item.serial_id)
      }));
    } else {
      setBulkSelectedItems(prev => ({ ...prev, [inventoryId]: [] }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'damaged':
        return 'bg-red-100 text-red-800';
      case 'in_repair':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canChangeStatus = (status: string) => {
    return status !== 'sold';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading inventory items...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Item Status Management
          </CardTitle>
          <CardDescription>
            View and update individual item statuses or change multiple items at once. Items marked as sold cannot be changed.
          </CardDescription>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="w-fit">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {inventoryItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No inventory items found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inventoryItems.map((inventory) => {
                const statusCounts = getItemStatusCounts(inventory.serial_items);
                const selectableItems = inventory.serial_items.filter(item => canChangeStatus(item.status));
                const selectedItems = bulkSelectedItems[inventory.id] || [];
                const allSelectableSelected = selectableItems.length > 0 && selectableItems.every(item => selectedItems.includes(item.serial_id));
                
                return (
                  <Card key={inventory.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{inventory.name}</h3>
                          <p className="text-sm text-gray-600">{inventory.description}</p>
                          <p className="text-sm text-gray-500 mt-1">Category: {inventory.category}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">Available: {statusCounts.available}</Badge>
                            <Badge variant="outline">Sold: {statusCounts.sold}</Badge>
                            <Badge variant="outline">Damaged: {statusCounts.damaged}</Badge>
                            <Badge variant="outline">In Repair: {statusCounts.in_repair}</Badge>
                            <Badge variant="outline">Unavailable: {statusCounts.unavailable}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Bulk Actions */}
                      {selectableItems.length > 0 && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-3">Bulk Actions</h4>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`select-all-${inventory.id}`}
                                checked={allSelectableSelected}
                                onCheckedChange={(checked) => handleSelectAllItems(inventory.id, selectableItems, checked as boolean)}
                              />
                              <label htmlFor={`select-all-${inventory.id}`} className="text-sm">
                                Select All ({selectableItems.length})
                              </label>
                            </div>
                            <span className="text-sm text-gray-500">
                              {selectedItems.length} selected
                            </span>
                          </div>
                          
                          {selectedItems.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Select
                                value={bulkStatusChanges[inventory.id] || ''}
                                onValueChange={(value) => 
                                  setBulkStatusChanges(prev => ({ ...prev, [inventory.id]: value }))
                                }
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="New status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="available">Available</SelectItem>
                                  <SelectItem value="damaged">Damaged</SelectItem>
                                  <SelectItem value="in_repair">In Repair</SelectItem>
                                  <SelectItem value="unavailable">Unavailable</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Textarea
                                placeholder="Reason for status change (optional)"
                                value={bulkReasons[inventory.id] || ''}
                                onChange={(e) => 
                                  setBulkReasons(prev => ({ ...prev, [inventory.id]: e.target.value }))
                                }
                                className="min-h-8 w-48"
                              />
                              
                              <Button
                                onClick={() => handleBulkStatusChange(inventory.id)}
                                disabled={updatingItem === inventory.id || !bulkStatusChanges[inventory.id]}
                                size="sm"
                              >
                                {updatingItem === inventory.id ? 'Updating...' : `Update ${selectedItems.length} Items`}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-3">
                        <h4 className="font-medium">Individual Items:</h4>
                        {inventory.serial_items.map((item) => (
                          <div key={item.serial_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                            {canChangeStatus(item.status) && (
                              <Checkbox
                                checked={selectedItems.includes(item.serial_id)}
                                onCheckedChange={(checked) => 
                                  handleBulkItemSelection(inventory.id, item.serial_id, checked as boolean)
                                }
                              />
                            )}
                            
                            <div className="flex-1">
                              <span className="font-mono text-sm">{item.serial_id}</span>
                              <Badge className={`ml-2 ${getStatusColor(item.status)}`}>
                                {item.status}
                              </Badge>
                              {item.status === 'sold' && (
                                <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                              )}
                            </div>
                            
                            {canChangeStatus(item.status) && (
                              <div className="flex items-center gap-2">
                                <Select
                                  value={statusChanges[item.serial_id] || ''}
                                  onValueChange={(value) => 
                                    setStatusChanges(prev => ({ ...prev, [item.serial_id]: value }))
                                  }
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Change status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="damaged">Damaged</SelectItem>
                                    <SelectItem value="in_repair">In Repair</SelectItem>
                                    <SelectItem value="unavailable">Unavailable</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                {statusChanges[item.serial_id] && (
                                  <>
                                    <Textarea
                                      placeholder="Reason for status change (optional)"
                                      value={reasons[item.serial_id] || ''}
                                      onChange={(e) => 
                                        setReasons(prev => ({ ...prev, [item.serial_id]: e.target.value }))
                                      }
                                      className="min-h-8 w-48"
                                    />
                                    <Button
                                      onClick={() => handleStatusChange(item.serial_id, statusChanges[item.serial_id])}
                                      disabled={updatingItem === item.serial_id}
                                      size="sm"
                                    >
                                      {updatingItem === item.serial_id ? 'Updating...' : 'Update'}
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemStatusManager;
