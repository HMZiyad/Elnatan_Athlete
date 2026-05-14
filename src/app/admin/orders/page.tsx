import React from 'react';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { AdminTable } from '@/components/molecules/AdminTable';
import { AdminBadge } from '@/components/atoms/AdminBadge';
import { Search, Filter, MoreVertical } from 'lucide-react';

export default function AdminOrdersPage() {
  const orders = [
    { id: 'Underrated-5421', customer: 'Alex Johnson', date: '2023-10-24', item: 2, total: '$130.00', status: 'Pending' },
    { id: 'Underrated-5420', customer: 'Jordan Smith', date: '2023-10-23', item: 1, total: '$65.00', status: 'Shipped' },
    { id: 'Underrated-5419', customer: 'Casey Rivers', date: '2023-10-22', item: 5, total: '$352.00', status: 'Shipped' },
    { id: 'Underrated-5418', customer: 'Morgan Lee', date: '2023-10-21', item: 3, total: '$125.00', status: 'Delivered' },
    { id: 'Underrated-5418', customer: 'Morgan Lee', date: '2023-10-10', item: 2, total: '$98.00', status: 'Delivered' },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Shipped': return 'default';
      case 'Delivered': return 'success';
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
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Orders..." 
              className="w-full bg-white border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black/20"
            />
          </div>
          <button className="p-4 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black transition-all">
            <Filter size={20} />
          </button>
        </div>

        {/* Table */}
        <AdminTable 
          columns={['Order ID', 'Customer', 'Date', 'Item', 'Total', 'Status']}
          totalItems={154}
          itemName="images" // Matching "Images" from screenshot typo
        >
          {orders.map((order, i) => (
            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-8 py-6 text-sm font-bold text-black">{order.id}</td>
              <td className="px-8 py-6 text-sm text-gray-500 font-medium">{order.customer}</td>
              <td className="px-8 py-6 text-sm text-gray-500 font-medium">{order.date}</td>
              <td className="px-8 py-6 text-sm text-gray-500 font-medium">{order.item}</td>
              <td className="px-8 py-6 text-sm text-black font-bold">{order.total}</td>
              <td className="px-8 py-6">
                <AdminBadge variant={getStatusVariant(order.status)}>
                  {order.status}
                </AdminBadge>
              </td>
              <td className="px-8 py-6">
                <button className="p-2 text-gray-300 hover:text-black rounded-lg transition-all">
                  <MoreVertical size={18} />
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </AdminLayout>
  );
}
