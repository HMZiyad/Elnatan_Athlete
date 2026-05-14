import React from 'react';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { AdminTable } from '@/components/molecules/AdminTable';
import { MoreVertical } from 'lucide-react';

export default function AdminCustomersPage() {
  const customers = [
    { name: 'Alex Johnson', email: 'alex@example.com', spent: '$450.50', orders: 4, lastOrder: '2023-10-24' },
    { name: 'Jordan Smith', email: 'jordan@example.com', spent: '$450.50', orders: 3, lastOrder: '2023-10-24' },
    { name: 'Casey Rivers', email: 'casey@example.com', spent: '$65.00', orders: 2, lastOrder: '2023-10-24' },
    { name: 'Morgan Lee', email: 'morgan@example.com', spent: '$890.20', orders: 7, lastOrder: '2023-10-23' },
    { name: 'Morgan Lee', email: 'morgan@example.com', spent: '$170.20', orders: 1, lastOrder: '2023-10-23' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Title Section */}
        <div>
          <h1 className="text-3xl font-bold text-black mb-1">Customers</h1>
          <p className="text-sm text-gray-400 font-medium tracking-tight">Overview of all customer details</p>
        </div>

        {/* Table */}
        <AdminTable 
          columns={['File Name', 'Registration', 'Spent', 'Orders', 'Last Order']}
          totalItems={154}
          itemName="Images" // Typo from screenshot
        >
          {customers.map((customer, i) => (
            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-8 py-6 text-sm font-bold text-black">{customer.name}</td>
              <td className="px-8 py-6 text-sm text-gray-500 font-medium">{customer.email}</td>
              <td className="px-8 py-6 text-sm text-black font-bold">{customer.spent}</td>
              <td className="px-8 py-6 text-sm text-gray-500 font-medium">{customer.orders}</td>
              <td className="px-8 py-6 text-sm text-gray-500 font-medium">{customer.lastOrder}</td>
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
