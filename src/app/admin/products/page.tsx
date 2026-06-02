"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { AdminTable } from '@/components/molecules/AdminTable';
import { AdminBadge } from '@/components/atoms/AdminBadge';
import { Search, Filter, Plus, Edit2, Trash2, Package, Upload } from 'lucide-react';
import { apiCall, apiUpload } from '@/utils/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [inventory, setInventory] = useState('');
  const [sizes, setSizes] = useState('S, M, L, XL');
  const [colors, setColors] = useState('Black, White');
  const [imageUrl, setImageUrl] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall<{ data: any[]; meta?: { total: number; per_page: number; page: number } }>(
        `/admin/products?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&per_page=10`
      );
      setProducts(res.data || []);
      if (res.meta) {
        setTotalItems(res.meta.total);
        setTotalPages(Math.ceil(res.meta.total / res.meta.per_page) || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTimer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(fetchTimer);
  }, [searchQuery, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Image Upload helper
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await apiUpload(file, 'product_image');
      const url = res.url.startsWith('http') ? res.url : `http://localhost:8080${res.url}`;
      setImageUrl(url);
    } catch (err: any) {
      alert(err.message || 'Failed to upload product image');
    } finally {
      setUploading(false);
    }
  };

  // Open modal helpers
  const openAddModal = () => {
    setName('');
    setCategory('');
    setPrice('');
    setInventory('');
    setSizes('S, M, L, XL');
    setColors('Black, White');
    setImageUrl('');
    setShowAddModal(true);
  };

  const openEditModal = (product: any) => {
    setSelectedProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price.toString());
    setInventory(product.inventory.toString());
    setShowEditModal(true);
  };

  // Submit Add
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !price) {
      alert('Please fill in name, category and price.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        category,
        price: parseFloat(price),
        inventory: parseInt(inventory) || 0,
        sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: colors.split(',').map(c => c.trim()).filter(Boolean),
        image_url: imageUrl
      };

      await apiCall('/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setShowAddModal(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !price) {
      alert('Please fill in name, category and price.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        category,
        price: parseFloat(price),
        inventory: parseInt(inventory) || 0,
      };

      await apiCall(`/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setShowEditModal(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Delete
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiCall(`/admin/products/${productId}`, {
        method: 'DELETE',
      });
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

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
            onClick={openAddModal}
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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black/20 focus:shadow-lg transition-all"
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
            <p className="text-gray-500 text-sm">Loading products...</p>
          </div>
        ) : (
          <AdminTable 
            columns={['Name', 'Category', 'Price', 'Inventory', 'Status']}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={10}
            itemName="products"
            onPageChange={handlePageChange}
          >
            {products.map((product) => {
              const image = product.image_url
                ? (product.image_url.startsWith('http') ? product.image_url : `http://localhost:8080${product.image_url}`)
                : '/assets/athelete_auth.png';

              const isOutOfStock = product.inventory <= 0;
              const statusText = isOutOfStock ? 'Out of Stock' : 'In Stock';

              return (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image src={image} alt={product.name} fill className="object-cover" />
                      </div>
                      <span className="font-bold text-black">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium">{product.category}</td>
                  <td className="px-8 py-6 text-sm text-black font-bold">${product.price.toFixed(2)}</td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium">{product.inventory} in stock</td>
                  <td className="px-8 py-6">
                    <AdminBadge variant={isOutOfStock ? 'error' : 'warning'}>
                      {statusText}
                    </AdminBadge>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminTable>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleAddProduct} className="p-10">
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
                    <input 
                      type="text" 
                      placeholder="e.g., Premium Sweatshirt" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Category</p>
                      <input 
                        type="text" 
                        placeholder="e.g., T-Shirts" 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Price ($)</p>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="65.00" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Stock Inventory</p>
                      <input 
                        type="number" 
                        placeholder="50" 
                        value={inventory}
                        onChange={(e) => setInventory(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Available Sizes</p>
                      <input 
                        type="text" 
                        placeholder="S, M, L, XL" 
                        value={sizes}
                        onChange={(e) => setSizes(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Product Image</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    
                    {imageUrl ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 group">
                        <Image src={imageUrl} alt="Product image preview" fill className="object-cover" />
                        <div 
                          onClick={handleImageUploadClick}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-bold transition-opacity cursor-pointer"
                        >
                          Change Image
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={handleImageUploadClick}
                        className="border-2 border-dashed border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center group cursor-pointer hover:border-black/10 hover:bg-gray-50 transition-all"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          {uploading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-400"></div>
                          ) : (
                            <Plus size={24} className="text-gray-300" />
                          )}
                        </div>
                        <p className="text-sm font-bold text-gray-400">
                          {uploading ? 'Uploading image...' : 'Add product image'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t border-gray-50">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-10 py-4 border border-gray-100 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting || uploading}
                    className="px-10 py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating...' : 'Add Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <form onSubmit={handleEditProduct} className="p-10">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                  <Package className="text-gray-400" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black mb-1">Edit Product</h2>
                  <p className="text-sm text-gray-400 font-medium">Update the product fields below</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="font-bold text-black uppercase tracking-tight text-sm">Product Details</h3>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Product Name</p>
                    <input 
                      type="text" 
                      placeholder="Product Name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Category</p>
                      <input 
                        type="text" 
                        placeholder="Category" 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Price ($)</p>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="Price" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" 
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Stock Inventory</p>
                      <input 
                        type="number" 
                        placeholder="Stock" 
                        value={inventory}
                        onChange={(e) => setInventory(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t border-gray-50">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-10 py-4 border border-gray-100 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-10 py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
