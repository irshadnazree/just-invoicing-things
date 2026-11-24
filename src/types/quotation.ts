import type { CompanyInfo } from "@/types/shared";

type QuotationLineItem = {
  name: string;
  details: Array<string>;
  quantity: number;
  rate: number;
  currency: string;
};

type QuotationListItem = {
  id: string;
  quotationId: string;
  projectTitle: string;
  quotationFor: string;
  quotationDate: string;
  paymentType: string;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

type QuotationFormData = {
  id: string;
  createdAt: string;
  updatedAt: string;
  quotationId: string;
  quotationDate: string;
  bankAccount: string;
  quotationFrom: CompanyInfo;
  quotationFor: CompanyInfo;
  projectTitle: string;
  paymentType: string;
  items: Array<QuotationLineItem>;
  currency: string;
  depositPercent: number;
  hasSecondPayment: boolean;
  secondPaymentPercent: number;
  terms: Array<string>;
};

type QuotationStore = {
  formData: QuotationFormData;
  updateField: <K extends keyof QuotationFormData>(
    field: K,
    value: QuotationFormData[K]
  ) => void;
  updateNestedField: (
    parent: "quotationFrom" | "quotationFor",
    field: keyof CompanyInfo,
    value: string
  ) => void;
  addItem: () => void;
  duplicateItem: (index: number) => void;
  removeItem: (index: number) => void;
  updateItem: <K extends keyof QuotationLineItem>(
    index: number,
    field: K,
    value: QuotationLineItem[K]
  ) => void;
  addItemDetail: (itemIndex: number) => void;
  removeItemDetail: (itemIndex: number, detailIndex: number) => void;
  updateItemDetail: (
    itemIndex: number,
    detailIndex: number,
    value: string
  ) => void;
  addTerm: () => void;
  duplicateTerm: (index: number) => void;
  removeTerm: (index: number) => void;
  updateTerm: (index: number, value: string) => void;
  importJSON: (
    jsonData: Partial<QuotationFormData> & {
      items?: Array<QuotationLineItem & { amount?: number }>;
    }
  ) => void;
  saveQuotation: () => boolean;
  loadQuotation: (id: string) => boolean;
  getAllQuotations: () => Array<QuotationFormData>;
  getAllQuotationsAsync: () => Promise<Array<QuotationFormData>>;
  deleteQuotation: (id: string) => void;
  bulkDeleteQuotations: (ids: Array<string>) => void;
  duplicateQuotation: (id: string) => string | null;
  initializeQuotation: () => void;
  isValidQuotation: () => boolean;
  resetForm: () => void;
};

export type {
  QuotationFormData,
  QuotationLineItem,
  QuotationStore,
  QuotationListItem,
};
