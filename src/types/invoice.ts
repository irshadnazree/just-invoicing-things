import type { CompanyInfo } from "@/types/shared";

export type InvoiceLineItem = {
  name: string;
  details: Array<string>;
  code: string;
  quantity: number;
  rate: number;
  currency: string;
};

export type InvoiceListItem = {
  id: string;
  invoiceId: string;
  invoiceFor: string;
  invoiceDate: string;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceFormData = {
  id: string;
  createdAt: string;
  updatedAt: string;
  invoiceId: string;
  invoiceDate: string;
  bankAccount: string;
  invoiceFrom: CompanyInfo;
  invoiceTo: CompanyInfo;
  items: Array<InvoiceLineItem>;
  currency: string;
  reductionAmount: number;
};

export type InvoiceStore = {
  formData: InvoiceFormData;
  updateField: <K extends keyof InvoiceFormData>(
    field: K,
    value: InvoiceFormData[K]
  ) => void;
  updateNestedField: (
    parent: "invoiceFrom" | "invoiceTo",
    field: keyof CompanyInfo,
    value: string
  ) => void;
  addItem: () => void;
  duplicateItem: (index: number) => void;
  removeItem: (index: number) => void;
  updateItem: <K extends keyof InvoiceLineItem>(
    index: number,
    field: K,
    value: InvoiceLineItem[K]
  ) => void;
  addItemDetail: (itemIndex: number) => void;
  removeItemDetail: (itemIndex: number, detailIndex: number) => void;
  updateItemDetail: (
    itemIndex: number,
    detailIndex: number,
    value: string
  ) => void;
  importJSON: (
    jsonData: Partial<InvoiceFormData> & {
      items?: Array<InvoiceLineItem & { amount?: number }>;
    }
  ) => void;
  saveInvoice: () => boolean;
  loadInvoice: (id: string) => boolean;
  getAllInvoices: () => Array<InvoiceFormData>;
  getAllInvoicesAsync: () => Promise<Array<InvoiceFormData>>;
  deleteInvoice: (id: string) => void;
  bulkDeleteInvoices: (ids: Array<string>) => void;
  duplicateInvoice: (id: string) => string | null;
  initializeInvoice: () => void;
  isValidInvoice: () => boolean;
  resetForm: () => void;
};
