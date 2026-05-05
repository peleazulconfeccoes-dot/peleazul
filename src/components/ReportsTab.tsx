import React from 'react';
import { BarChart2, Download, TrendingUp, Calendar, Hash, FilePlus, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { BillingRecord, Client, Product } from '../types';

interface ReportsTabProps {
  billingRecords: BillingRecord[];
  clients: Client[];
  products: Product[];
}

export default function ReportsTab({ billingRecords, clients, products }: ReportsTabProps) {
  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'N/A';
  const getProductRef = (id: string) => products.find(p => p.id === id)?.reference || 'N/A';

  const totalPieces = billingRecords.reduce((sum, r) => sum + r.quantity, 0);
  const totalBillings = billingRecords.length;

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    const title = 'Relatório de Faturamento - JeansFaction';
    
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text(title, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    doc.text(`Total de Peças: ${totalPieces}`, 14, 36);

    const tableData = billingRecords.map((r, i) => [
      r.invoiceNumber || 'S/N',
      getClientName(r.clientId),
      getProductRef(r.productId),
      r.quantity.toString(),
      r.entryNotes || '-',
      r.returnNote || '-',
      format(parseISO(r.issueDate), 'dd/MM/yy'),
      format(parseISO(r.dueDate), 'dd/MM/yy'),
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Fatura', 'Cliente', 'Ref', 'Qtd', 'Entrada', 'Retorno', 'Emissão', 'Venc.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: 'fill', fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save(`relatorio-faturamento-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Volume Produzido', val: totalPieces, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Lotes Faturados', val: totalBillings, icon: FilePlus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Média por Lote', val: totalBillings > 0 ? (totalPieces / totalBillings).toFixed(1) : 0, icon: BarChart2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Clientes Ativos', val: clients.length, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Resumo Consolidado</h2>
          <button
            onClick={exportPDF}
            className="flex items-center px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-bold hover:bg-red-100 transition-colors uppercase tracking-widest"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            Gerar PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                <th className="p-4">Fatura</th>
                <th className="p-4">Cliente Credor</th>
                <th className="p-4">Referência</th>
                <th className="p-4 text-right">Qtd</th>
                <th className="p-4">Vencimento</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {billingRecords.length > 0 ? (
                [...billingRecords].reverse().map((record) => (
                  <tr key={record.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-700">#{record.invoiceNumber || 'S/N'}</td>
                    <td className="p-4 font-medium">{getClientName(record.clientId)}</td>
                    <td className="p-4 opacity-70 uppercase tracking-tighter text-[10px] font-bold">{getProductRef(record.productId)}</td>
                    <td className="p-4 text-right font-black">{record.quantity}</td>
                    <td className="p-4">
                      <span className="font-bold text-blue-600">{format(parseISO(record.dueDate), 'dd/MM/yy')}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold uppercase">OK</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                    Nenhum dado para consolidar no relatório.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
