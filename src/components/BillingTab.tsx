import React, { useState } from 'react';
import { FilePlus, Trash2, Search, Calendar, ChevronRight } from 'lucide-react';
import { addDays, format, parseISO } from 'date-fns';
import { BillingRecord, Client, Product } from '../types';
import { storage } from '../storage';

interface BillingTabProps {
  billingRecords: BillingRecord[];
  clients: Client[];
  products: Product[];
  onRefresh: () => void;
}

export default function BillingTab({ billingRecords, clients, products, onRefresh }: BillingTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newBilling, setNewBilling] = useState<Partial<BillingRecord>>({
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    quantity: 1,
    status: 'pending',
  });

  const handleIssueDateChange = (dateStr: string) => {
    const issueDate = parseISO(dateStr);
    const dueDate = addDays(issueDate, 7);
    setNewBilling({
      ...newBilling,
      issueDate: dateStr,
      dueDate: format(dueDate, 'yyyy-MM-dd'),
    });
  };

  const handleAddBilling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBilling.clientId || !newBilling.productId) return;

    const record: BillingRecord = {
      id: crypto.randomUUID(),
      clientId: newBilling.clientId || '',
      productId: newBilling.productId || '',
      quantity: Number(newBilling.quantity) || 0,
      entryNotes: newBilling.entryNotes || '',
      invoiceNumber: newBilling.invoiceNumber || '',
      returnNote: newBilling.returnNote || '',
      issueDate: newBilling.issueDate || format(new Date(), 'yyyy-MM-dd'),
      dueDate: newBilling.dueDate || format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      status: 'pending',
      totalAmount: 0,
      createdAt: Date.now(),
    };

    storage.addBilling(record);
    setNewBilling({
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      quantity: 1,
      status: 'pending',
    });
    setIsAdding(false);
    onRefresh();
  };

  const handleDeleteBilling = (id: string) => {
    if (confirm('Deseja excluir este faturamento?')) {
      const updated = billingRecords.filter(b => b.id !== id);
      storage.saveBilling(updated);
      onRefresh();
    }
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'N/A';
  const getProductRef = (id: string) => products.find(p => p.id === id)?.reference || 'N/A';

  const filteredRecords = billingRecords.filter(r => 
    getClientName(r.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.invoiceNumber.includes(searchTerm) ||
    getProductRef(r.productId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Quick Entry / Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Gestão de Notas e Faturas</h2>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
            <input
              type="text"
              placeholder="Filtro rápido..."
              className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded text-[11px] outline-none focus:ring-1 ring-blue-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                <th className="p-4">Nº Fatura</th>
                <th className="p-4">Cliente / Produto</th>
                <th className="p-4">Notas (E / R)</th>
                <th className="p-4">Vencimento</th>
                <th className="p-4 text-right">Qtd</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{record.invoiceNumber || 'S/N'}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{getClientName(record.clientId)}</div>
                      <div className="text-[10px] opacity-60">REF: {getProductRef(record.productId)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title="Entrada">E: {record.entryNotes || '-'}</span>
                        <span className="text-[10px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 text-blue-700" title="Retorno">R: {record.returnNote || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-blue-600">{format(parseISO(record.dueDate), 'dd/MM/yy')}</div>
                      <div className="text-[10px] opacity-50">Emit: {format(parseISO(record.issueDate), 'dd/MM/yy')}</div>
                    </td>
                    <td className="p-4 text-right font-black">{record.quantity}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteBilling(record.id)}
                        className="p-1.5 text-slate-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                    Nenhuma movimentação para exibir.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => setIsAdding(true)}
        className="md:hidden fixed bottom-16 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <FilePlus className="w-6 h-6" />
      </button>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Lançamento de Nova Nota</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Referência: {new Date().getFullYear()}</span>
            </div>
            <form onSubmit={handleAddBilling} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente Credor *</label>
                  <select
                    required
                    className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 ring-blue-500 outline-none bg-slate-50"
                    value={newBilling.clientId || ''}
                    onChange={e => setNewBilling({...newBilling, clientId: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Produto / Referência *</label>
                  <select
                    required
                    className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 ring-blue-500 outline-none bg-slate-50"
                    value={newBilling.productId || ''}
                    onChange={e => setNewBilling({...newBilling, productId: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.reference} - {p.description}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quant. Peças</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-slate-200 rounded text-xs font-bold"
                    value={newBilling.quantity || ''}
                    onChange={e => setNewBilling({...newBilling, quantity: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emissão</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                    value={newBilling.issueDate || ''}
                    onChange={e => handleIssueDateChange(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vencimento (D+7)</label>
                  <input
                    readOnly
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded text-xs bg-slate-100 font-bold text-blue-600"
                    value={newBilling.dueDate ? format(parseISO(newBilling.dueDate), 'dd/MM/yyyy') : ''}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nº Fatura</label>
                  <input
                    type="text"
                    placeholder="NF-0000"
                    className="w-full p-2 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900 uppercase"
                    value={newBilling.invoiceNumber || ''}
                    onChange={e => setNewBilling({...newBilling, invoiceNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notas de Entrada</label>
                  <input
                    type="text"
                    placeholder="Separe por vírgula se houver mais de uma"
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                    value={newBilling.entryNotes || ''}
                    onChange={e => setNewBilling({...newBilling, entryNotes: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nota de Retorno</label>
                  <input
                    type="text"
                    placeholder="Nº Nota Retorno"
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                    value={newBilling.returnNote || ''}
                    onChange={e => setNewBilling({...newBilling, returnNote: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded transition-colors"
                >
                  Cancelar Lançamento
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Confirmar e Gerar Fatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
