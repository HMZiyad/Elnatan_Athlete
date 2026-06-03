"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { AdminTable } from '@/components/molecules/AdminTable';
import { AdminBadge } from '@/components/atoms/AdminBadge';
import { Search } from 'lucide-react';
import { apiCall } from '@/utils/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, Status Filter & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall<{ data: any[]; meta?: { total: number; per_page: number; page: number } }>(
        `/admin/orders?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}&page=${currentPage}&per_page=10`
      );
      setOrders(res.data || []);
      if (res.meta) {
        setTotalItems(res.meta.total);
        setTotalPages(Math.ceil(res.meta.total / res.meta.per_page) || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiCall(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      // Refresh list
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Processing': return 'warning';
      case 'Shipped': return 'default';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Title Section */}
        <div>
          <h1 className="text-3xl font-bold text-black mb-1">Orders</h1>
          <p className="text-sm text-gray-400 font-medium tracking-tight">Overview of recent orders</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Orders by Order # or Customer..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-black bg-white border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black/20"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm text-gray-500 font-bold focus:outline-none focus:border-black/20 appearance-none pr-10 cursor-pointer min-w-[150px]"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-bold">▾</div>
          </div>
        </div>

        {/* Error handling */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black mb-4"></div>
            <p className="text-gray-500 text-sm">Loading orders...</p>
          </div>
        ) : (
          <AdminTable 
            columns={['Order Number', 'Customer', 'Date', 'Items Count', 'Total Cost', 'Status Update', 'Status Badge']}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={10}
            itemName="orders"
            onPageChange={handlePageChange}
          >
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6 text-sm font-bold text-black">{order.order_number}</td>
                <td className="px-8 py-6">
                  <div className="text-sm font-bold text-black">{order.customer_name}</div>
                  <div className="text-xs text-gray-400 font-medium">{order.customer_email}</div>
                </td>
                <td className="px-8 py-6 text-sm text-gray-500 font-medium">{order.date}</td>
                <td className="px-8 py-6 text-sm text-gray-500 font-medium">{order.item_count} items</td>
                <td className="px-8 py-6 text-sm text-black font-bold">${order.total.toFixed(2)}</td>
                <td className="px-8 py-6">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold px-3 py-2 text-black focus:outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-8 py-6">
                  <AdminBadge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </AdminBadge>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>
    </AdminLayout>
  );
}
