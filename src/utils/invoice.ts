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

  const existingInvoices = loadInvoicesFromStorage();
  const nextInvoiceId =
    formData.invoiceId ||
    getNextDisplayId(
      existingInvoices,
      (invoice) => invoice.invoiceId,
      DEFAULT_INVOICE_ID
    );

  return {
    ...formData,
    id: formData.id || generateRandomString(10),
    invoiceId: nextInvoiceId,
    invoiceDate: formData.invoiceDate || today,
  };
}

export function loadInvoicesFromStorage(): Array<InvoiceFormData> {
  return loadFromStorage<InvoiceFormData>(STORAGE_KEY);
}

export function saveInvoicesToStorage(invoices: Array<InvoiceFormData>): void {
  saveToStorage(STORAGE_KEY, invoices);
}

export function findInvoiceById(id: string): InvoiceFormData | null {
  return findItemById<InvoiceFormData>(STORAGE_KEY, id);
}

export function deleteInvoicesFromStorage(ids: Array<string>): void {
  const idsToDelete = new Set(ids);
  const invoices = loadInvoicesFromStorage();
  const filteredInvoices = invoices.filter(
    (invoice) => !idsToDelete.has(invoice.id)
  );
  saveInvoicesToStorage(filteredInvoices);
}

export function isInvoiceValid(invoiceData: InvoiceFormData): boolean {
  const hasInvoiceId = invoiceData.invoiceId.trim() !== "";
  // WARNING: invoiceId and invoiceDate are generated, so require something the user entered
  const hasClient = invoiceData.invoiceTo.company.trim() !== "";
  const hasItems = invoiceData.items.length > 0;
  return hasInvoiceId && (hasClient || hasItems);
}

export function saveInvoiceToArray(invoiceData: InvoiceFormData): boolean {
  return saveItemToArray(STORAGE_KEY, invoiceData, isInvoiceValid);
}
