
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { getDashboardStats, getOrders } from '@/services/databaseService';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Order, DashboardStats } from '@/types';

const Index: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch dashboard statistics using react-query
  const { data: dashboardStats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  // Fetch orders using react-query
  const { data: ordersData, isLoading: ordersLoading, isError: ordersError } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  useEffect(() => {
    if (dashboardStats) {
      setStats(dashboardStats as DashboardStats);
    }

    if (ordersData) {
      setOrders(ordersData);
    }
  }, [dashboardStats, ordersData]);

  const formatDate = (date: Date | undefined): string => {
    return date ? format(date, 'PPP') : 'No date selected';
  };

  const getProductCount = (order: Order) => {
    if (!order.products) return 0;
    if (typeof order.products === 'number') return order.products;
    return Array.isArray(order.products) ? order.products.length : 0;
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
            <CardDescription>Number of products in the inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="w-20 h-8" /> : (
              <div className="text-2xl font-semibold">{stats?.totalProducts}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Stock</CardTitle>
            <CardDescription>Total quantity of all products</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="w-20 h-8" /> : (
              <div className="text-2xl font-semibold">{stats?.totalStock}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Pending</CardTitle>
            <CardDescription>Orders that are pending or processing</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="w-20 h-8" /> : (
              <div className="text-2xl font-semibold">{stats?.ordersPending}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>Total value of all sales</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="w-20 h-8" /> : (
              <div className="text-2xl font-semibold">${stats?.totalSales?.toFixed(2)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue for the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="w-full h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats?.monthlyRevenue?.map((revenue, index) => ({
                  month: index + 1,
                  revenue,
                }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Orders</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDate(date)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <DatePicker
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders Overview</CardTitle>
          <CardDescription>Your recent orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Skeleton className="w-[200px] h-8 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : ordersError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Error loading orders.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.userId || "Unknown User"}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'PPP')}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{getProductCount(order)}</TableCell>
                    <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
