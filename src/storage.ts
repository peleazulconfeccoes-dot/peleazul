import { Client, Product, BillingRecord } from './types';

const STORAGE_KEYS = {
  CLIENTS: 'jeans_manager_clients',
  PRODUCTS: 'jeans_manager_products',
  BILLING: 'jeans_manager_billing',
};

export const storage = {
  // Clients
  getClients: (): Client[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },
  saveClients: (clients: Client[]) => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },
  addClient: (client: Client) => {
    const clients = storage.getClients();
    storage.saveClients([...clients, client]);
  },

  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  addProduct: (product: Product) => {
    const products = storage.getProducts();
    storage.saveProducts([...products, product]);
  },

  // Billing
  getBilling: (): BillingRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BILLING);
    return data ? JSON.parse(data) : [];
  },
  saveBilling: (records: BillingRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.BILLING, JSON.stringify(records));
  },
  addBilling: (record: BillingRecord) => {
    const records = storage.getBilling();
    storage.saveBilling([...records, record]);
  },
};
