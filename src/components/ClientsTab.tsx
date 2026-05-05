import React, { useState } from 'react';
import { Plus, Trash2, Search, UserPlus } from 'lucide-react';
import { Client } from '../types';
import { storage } from '../storage';

interface ClientsTabProps {
  clients: Client[];
  onRefresh: () => void;
}

export default function ClientsTab({ clients, onRefresh }: ClientsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({});

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;

    const client: Client = {
      id: crypto.randomUUID(),
      name: newClient.name || '',
      contact: newClient.contact || '',
      email: newClient.email || '',
      document: newClient.document || '',
      address: newClient.address || '',
      createdAt: Date.now(),
    };

    storage.addClient(client);
    setNewClient({});
    setIsAdding(false);
    onRefresh();
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const updatedClients = clients.filter(c => c.id !== id);
      storage.saveClients(updatedClients);
      onRefresh();
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Base de Clientes</h2>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                <th className="p-4">Razão Social / Nome</th>
                <th className="p-4">CPF / CNPJ</th>
                <th className="p-4">Contato</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{client.name}</div>
                      <div className="text-[10px] opacity-60 truncate max-w-[200px]">{client.email}</div>
                    </td>
                    <td className="p-4 font-mono">{client.document || '-'}</td>
                    <td className="p-4">{client.contact || '-'}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-1.5 text-slate-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 italic font-medium">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Add Button for Mobile or secondary trigger */}
      <button
        onClick={() => setIsAdding(true)}
        className="md:hidden fixed bottom-16 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Novo Cadastro de Cliente</h3>
            </div>
            <form onSubmit={handleAddClient} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome / Razão Social *</label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 ring-blue-500"
                  value={newClient.name || ''}
                  onChange={e => setNewClient({...newClient, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPF / CNPJ</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 ring-blue-500"
                    value={newClient.document || ''}
                    onChange={e => setNewClient({...newClient, document: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contato</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 ring-blue-500"
                    value={newClient.contact || ''}
                    onChange={e => setNewClient({...newClient, contact: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail Corporativo</label>
                <input
                  type="email"
                  className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 ring-blue-500"
                  value={newClient.email || ''}
                  onChange={e => setNewClient({...newClient, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endereço Completo</label>
                <textarea
                  className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 ring-blue-500 h-20 resize-none bg-slate-50"
                  value={newClient.address || ''}
                  onChange={e => setNewClient({...newClient, address: e.target.value})}
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
