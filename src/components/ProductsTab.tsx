import React, { useState } from 'react';
import { Package, Trash2, Search, PlusCircle } from 'lucide-react';
import { Product } from '../types';
import { storage } from '../storage';

interface ProductsTabProps {
  products: Product[];
  onRefresh: () => void;
}

export default function ProductsTab({ products, onRefresh }: ProductsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.reference) return;

    const product: Product = {
      id: crypto.randomUUID(),
      reference: newProduct.reference || '',
      description: newProduct.description || '',
      unitPrice: Number(newProduct.unitPrice) || 0,
      createdAt: Date.now(),
    };

    storage.addProduct(product);
    setNewProduct({});
    setIsAdding(false);
    onRefresh();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      storage.saveProducts(updatedProducts);
      onRefresh();
    }
  };

  const filteredProducts = products.filter(p => 
    p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Catálogo de Referências</h2>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded text-[11px] outline-none focus:ring-1 ring-blue-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-slate-200 border-b border-slate-200">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white p-4 group relative hover:bg-blue-50/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded flex items-center justify-center text-slate-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-600 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter">REF: {product.reference}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 h-7 overflow-hidden leading-relaxed">
                    {product.description || 'Sem descrição cadastrada.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  <span>Data Registro</span>
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 italic font-medium bg-white">
              Nenhum produto em catálogo.
            </div>
          )}
        </div>
      </div>

      {/* Floating Add trigger */}
      <button
        onClick={() => setIsAdding(true)}
        className="md:hidden fixed bottom-16 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Adicionar Nova Referência</h3>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referência *</label>
                <input
                  required
                  type="text"
                  placeholder="EX: CL-102, BF-500"
                  className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 ring-blue-500"
                  value={newProduct.reference || ''}
                  onChange={e => setNewProduct({...newProduct, reference: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição Detalhada</label>
                <textarea
                  placeholder="Informe detalhes técnicos do produto..."
                  className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 ring-blue-500 h-24 resize-none bg-slate-50"
                  value={newProduct.description || ''}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
