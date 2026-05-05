export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  document: string; // CNPJ/CPF
  address: string;
  createdAt: number;
}

export interface Product {
  id: string;
  reference: string;
  description: string;
  unitPrice: number;
  createdAt: number;
}

export interface BillingRecord {
  id: string;
  clientId: string;
  productId: string;
  quantity: number;
  entryNotes: string; // Notas de entrada
  invoiceNumber: string; // Número da nota de fatura
  returnNote: string; // Nota de retorno
  issueDate: string; // ISO Date
  dueDate: string; // ISO Date (issueDate + 7 days)
  status: 'pending' | 'paid' | 'overdue';
  totalAmount: number;
  createdAt: number;
}
