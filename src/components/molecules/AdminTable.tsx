import React from 'react';
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

interface AdminTableProps {
  columns: string[];
  children: React.ReactNode;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemName?: string;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export const AdminTable: React.FC<AdminTableProps> = ({ 
  columns, 
  children, 
  currentPage = 1, 
  totalPages = 1, 
  totalItems = 0,
  itemName = "customers",
  itemsPerPage = 10,
  onPageChange
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/30">
              {columns.map((col, i) => (
                <th key={i} className="px-8 py-6 text-sm font-bold text-black uppercase tracking-tight">
                  {col}
                </th>
              ))}
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {children}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="p-8 flex justify-between items-center bg-gray-50/20">
          <p className="text-sm font-medium text-gray-400">
            Showing <span className="text-black font-bold">{startItem} to {endItem}</span> of {totalItems} {itemName}
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center text-gray-300 hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => onPageChange?.(i + 1)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-black text-white' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center text-gray-300 hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
