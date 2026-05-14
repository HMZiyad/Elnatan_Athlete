"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { AdminTable } from '@/components/molecules/AdminTable';
import { AdminBadge } from '@/components/atoms/AdminBadge';
import { Search, Filter, Plus, Edit2, Trash2, Package } from 'lucide-react';

export default function AdminProductsPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const products = [
    { name: 'Underrated T shirtt', category: 'T-Shirt', price: '$65', inventory: '42 in stock', status: 'In Stock' },
    { name: 'Underrated T shirtt', category: 'T-Shirt', price: '$65', inventory: '42 in stock', status: 'In Stock' },
    { name: 'Underrated T shirtt', category: 'T-Shirt', price: '$65', inventory: '0 in stock', status: 'Out of Stock' },
    { name: 'Underrated T shirtt', category: 'T-Shirt', price: '$65', inventory: '42 in stock', status: 'In Stock' },
    { name: 'Underrated T shirtt', category: 'T-Shirt', price: '$65', inventory: '0 in stock', status: 'Out of Stock' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-black mb-1">Products</h1>
            <p className="text-sm text-gray-400 font-medium tracking-tight">Overview of all products and their current inventory status</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Product..." 
              className="w-full bg-white border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black/20 focus:shadow-lg transition-all"
            />
          </div>
          <button className="p-4 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black transition-all">
            <Filter size={20} />
          </button>
        </div>

        {/* Table */}
        <AdminTable 
          columns={['Name', 'Category', 'Price', 'Inventory', 'Status']}
          totalItems={154}
          itemName="products"
        >
          {products.map((product, i) => (
            <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src="/assets/athelete_auth.png" alt={product.name} width={48} height={48} className="object-cover opacity-50" />
                  </div>
                  <span className="font-bold text-black">{product.name}</span>
                </div>
              </td>
              <td className="px-8 py-6 text-sm text-gray-500 font-medium">{product.category}</td>
              <td className="px-8 py-6 text-sm text-black font-bold">{product.price}</td>
              <td className="px-8 py-6 text-sm text-gray-500 font-medium">{product.inventory}</td>
              <td className="px-8 py-6">
                <AdminBadge variant={product.status === 'In Stock' ? 'warning' : 'error'}>
                  {product.status}
                </AdminBadge>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                  <Package className="text-gray-400" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black mb-1">Add New Product</h2>
                  <p className="text-sm text-gray-400 font-medium">Fill in the details for add new product</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="font-bold text-black uppercase tracking-tight text-sm">Product Details</h3>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Product Name</p>
                    <input type="text" placeholder="e.g., premium tshirt" className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Catagory</p>
                      <input type="text" placeholder="e.g., t-shirt" className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Price</p>
                      <input type="text" placeholder="$422" className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Stock</p>
                      <input type="text" placeholder="83" className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Available size</p>
                      <input type="text" placeholder="S" className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Product Image</p>
                    <div className="border-2 border-dashed border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center group cursor-pointer hover:border-black/10 hover:bg-gray-50 transition-all">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus size={24} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-bold text-gray-400">Add product image</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t border-gray-50">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="px-10 py-4 border border-gray-100 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button className="px-10 py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-xl shadow-black/10">
                    Add Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
