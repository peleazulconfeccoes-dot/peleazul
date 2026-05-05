/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Users, Package, FileText, BarChart2, Plus, Download, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Product, BillingRecord } from './types';
import { storage } from './storage';
import ClientsTab from './components/ClientsTab';
import ProductsTab from './components/ProductsTab';
import BillingTab from './components/BillingTab';
import ReportsTab from './components/ReportsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'clients' | 'products' | 'billing' | 'reports'>('billing');
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);

  useEffect(() => {
    setClients(storage.getClients());
    setProducts(storage.getProducts());
    setBillingRecords(storage.getBilling());
  }, []);

  const refreshData = () => {
    setClients(storage.getClients());
    setProducts(storage.getProducts());
    setBillingRecords(storage.getBilling());
  };

  const tabs = [
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'billing', label: 'Faturamento', icon: FileText },
    { id: 'reports', label: 'Relatórios', icon: BarChart2 },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-100 flex h-screen overflow-hidden font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0 text-slate-300 hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">DF</div>
          <div>
            <h1 className="font-bold text-white leading-tight uppercase tracking-wider text-sm">JeansFaction</h1>
            <p className="text-[10px] opacity-50 uppercase">ERP de Produção</p>
          </div>
        </div>

        <nav className="flex-1 py-4 uppercase text-[11px] font-bold tracking-widest space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'opacity-50'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="bg-slate-800 p-3 rounded-lg text-xs">
            <p className="opacity-50 text-[10px] uppercase font-bold mb-1">Operador</p>
            <p className="font-medium text-slate-200">Administrador</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-slate-400 uppercase tracking-widest text-[10px]">Módulo</span>
            <span className="text-slate-300">/</span>
            <span className="capitalize">{activeTab}</span>
          </div>
          
          <div className="flex gap-3">
            {activeTab !== 'reports' && (
              <button 
                onClick={() => {
                  // This is a placeholder since the add button is usually inside the tab
                  // but we can trigger it if we add a state for it in App.tsx later
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 uppercase tracking-widest transition-all"
              >
                + Novo {activeTab === 'clients' ? 'Cliente' : activeTab === 'products' ? 'Produto' : 'Faturamento'}
              </button>
            )}
          </div>
        </header>

        {/* Mobile Nav (Fallback) */}
        <div className="md:hidden flex bg-slate-900 overflow-x-auto border-b border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-[10px] font-bold uppercase whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="max-w-7xl mx-auto"
            >
              {activeTab === 'clients' && (
                <ClientsTab clients={clients} onRefresh={refreshData} />
              )}
              {activeTab === 'products' && (
                <ProductsTab products={products} onRefresh={refreshData} />
              )}
              {activeTab === 'billing' && (
                <BillingTab 
                  billingRecords={billingRecords} 
                  clients={clients} 
                  products={products} 
                  onRefresh={refreshData} 
                />
              )}
              {activeTab === 'reports' && (
                <ReportsTab 
                  billingRecords={billingRecords} 
                  clients={clients} 
                  products={products} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="h-12 bg-slate-900 text-slate-400 px-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest shrink-0">
          <div className="flex gap-6">
            <span>Total Peças: <span className="text-white">{billingRecords.reduce((s, r) => s + r.quantity, 0)}</span></span>
            <span>Registros: <span className="text-blue-400">{billingRecords.length}</span></span>
          </div>
          <div>JeansFaction v2.0.0 • {new Date().getFullYear()}</div>
        </footer>
      </main>
    </div>
  );
}
