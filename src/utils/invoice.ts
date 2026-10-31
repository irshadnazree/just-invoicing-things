import type { InvoiceFormData } from "@/types/invoice";
import { generateRandomString, getNextDisplayId } from "@/utils/id-helpers";
import {
  findItemById,
  loadFromStorage,
  saveItemToArray,
  saveToStorage,
} from "@/utils/storage-helpers";

const STORAGE_KEY = "invoices";
const currentYear = new Date().getFullYear();
const DEFAULT_INVOICE_ID = `INV-${currentYear}-001`;

export function generateId(formData: InvoiceFormData): InvoiceFormData {
  const today = new Date().toISOString().split("T")[0];

  // Load existing invoices to generate next ID
  const existingInvoices = loadInvoicesFromStorage();
  const nextInvoiceId =
    formData.invoiceId ||
    getNextDisplayId(existingInvoices, "invoiceId", DEFAULT_INVOICE_ID);

  return {
    ...formData,
    id: formData.id || generateRandomString(10),
    invoiceId: nextInvoiceId,
    invoiceDate: formData.invoiceDate || today,
  };
}

export function loadInvoicesFromStorage(): InvoiceFormData[] {
  return loadFromStorage<InvoiceFormData>(STORAGE_KEY);
}

export function saveInvoicesToStorage(invoices: InvoiceFormData[]): void {
  saveToStorage(STORAGE_KEY, invoices);
}

export function findInvoiceById(id: string): InvoiceFormData | null {
  return findItemById<InvoiceFormData>(STORAGE_KEY, id);
}

export function deleteInvoicesFromStorage(ids: string[]): void {
  const idsToDelete = new Set(ids);
  const invoices = loadInvoicesFromStorage();
  const filteredInvoices = invoices.filter(
    (invoice) => !idsToDelete.has(invoice.id)
  );
  saveInvoicesToStorage(filteredInvoices);
}

// Validate that invoice has required fields filled
export function isInvoiceValid(invoiceData: InvoiceFormData): boolean {
  // Check required fields are not empty
  const hasInvoiceId = invoiceData.invoiceId.trim() !== "";
  // invoiceId and invoiceDate are generated, so require something the user entered
  const hasClient = invoiceData.invoiceTo.company.trim() !== "";
  const hasItems = invoiceData.items.length > 0;
  return hasInvoiceId && (hasClient || hasItems);
}

export function saveInvoiceToArray(invoiceData: InvoiceFormData): boolean {
  return saveItemToArray(STORAGE_KEY, invoiceData, isInvoiceValid);
}
