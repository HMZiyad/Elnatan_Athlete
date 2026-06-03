"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { AdminTable } from '@/components/molecules/AdminTable';
import { Search } from 'lucide-react';
import { apiCall } from '@/utils/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall<{ data: any[]; meta?: { total: number; per_page: number; page: number } }>(
        `/admin/customers?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&per_page=10`
      );
      setCustomers(res.data || []);
      if (res.meta) {
        setTotalItems(res.meta.total);
        setTotalPages(Math.ceil(res.meta.total / res.meta.per_page) || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Title Section */}
        <div>
          <h1 className="text-3xl font-bold text-black mb-1">Customers</h1>
          <p className="text-sm text-gray-400 font-medium tracking-tight">Overview of all customer details</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Customers by name or email..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-black bg-white border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black/20"
            />
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
            <p className="text-gray-500 text-sm">Loading customers directory...</p>
          </div>
        ) : (
          <AdminTable 
            columns={['Name', 'Email Address', 'Total Spent', 'Orders Count', 'Joined Date']}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={10}
            itemName="customers"
            onPageChange={handlePageChange}
          >
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6 text-sm font-bold text-black">{customer.full_name}</td>
                <td className="px-8 py-6 text-sm text-gray-500 font-medium">{customer.email}</td>
                <td className="px-8 py-6 text-sm text-black font-bold">${customer.total_spent.toFixed(2)}</td>
                <td className="px-8 py-6 text-sm text-gray-500 font-medium">{customer.total_orders} orders</td>
                <td className="px-8 py-6 text-sm text-gray-500 font-medium">{formatDate(customer.joined_at)}</td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>
    </AdminLayout>
  );
}
