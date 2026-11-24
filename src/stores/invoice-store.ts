import { create } from "zustand";

import type {
  InvoiceFormData,
  InvoiceLineItem,
  InvoiceStore,
} from "@/types/invoice";
import {
  generateRandomString,
  incrementCodeFlexible,
} from "@/utils/id-helpers";
import {
  deleteInvoicesFromStorage,
  findInvoiceById,
  generateId,
  isInvoiceValid,
  loadInvoicesFromStorage,
  saveInvoiceToArray,
} from "@/utils/invoice";

export const initialFormData: InvoiceFormData = {
  id: "",
  createdAt: "",
  updatedAt: "",
  invoiceId: "",
  invoiceDate: "",
  bankAccount: "",
  invoiceFrom: {
    company: "",
  },
  invoiceTo: {
    company: "",
  },
  items: [],
  currency: "RM",
  reductionAmount: 0,
};

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  formData: initialFormData,

  updateField: (field, value) =>
    set((state) => {
      let updatedFormData = { ...state.formData, [field]: value };

      if (field === "currency" && typeof value === "string") {
        updatedFormData = {
          ...updatedFormData,
          items: state.formData.items.map((item) => ({
            ...item,
            currency: value,
          })),
        };
      }

      return {
        formData: updatedFormData,
      };
    }),

  updateNestedField: (parent, field, value) =>
    set((state) => {
      const updatedFormData = {
        ...state.formData,
        [parent]: { ...state.formData[parent], [field]: value },
      };

      return {
        formData: updatedFormData,
      };
    }),

  addItem: () =>
    set((state) => {
      const updatedFormData = {
        ...state.formData,
        items: [
          ...state.formData.items,
          {
            name: "",
            details: [],
            code: "",
            quantity: 1,
            rate: 0,
            currency: state.formData.currency || "RM",
          },
        ],
      };

      return {
        formData: updatedFormData,
      };
    }),

  duplicateItem: (index) =>
    set((state) => {
      const itemToDuplicate = state.formData.items[index];
      const duplicatedItem: InvoiceLineItem = {
        name: itemToDuplicate.name,
        details: [...itemToDuplicate.details],
        code: itemToDuplicate.code,
        quantity: itemToDuplicate.quantity,
        rate: itemToDuplicate.rate,
        currency: itemToDuplicate.currency,
      };
      const newItems = [...state.formData.items];
      newItems.splice(index + 1, 0, duplicatedItem);
      const updatedFormData = {
        ...state.formData,
        items: newItems,
      };

      return {
        formData: updatedFormData,
      };
    }),

  removeItem: (index) =>
    set((state) => {
      const updatedFormData = {
        ...state.formData,
        items: state.formData.items.filter((_, i) => i !== index),
      };

      return {
        formData: updatedFormData,
      };
    }),

  updateItem: (index, field, value) =>
    set((state) => {
      const newItems = [...state.formData.items];
      newItems[index] = { ...newItems[index], [field]: value };
      const updatedFormData = { ...state.formData, items: newItems };

      return {
        formData: updatedFormData,
      };
    }),

  addItemDetail: (itemIndex) =>
    set((state) => {
      const newItems = [...state.formData.items];
      newItems[itemIndex].details.push("");
      const updatedFormData = { ...state.formData, items: newItems };

      return {
        formData: updatedFormData,
      };
    }),

  removeItemDetail: (itemIndex, detailIndex) =>
    set((state) => {
      const newItems = [...state.formData.items];
      newItems[itemIndex].details = newItems[itemIndex].details.filter(
        (_, i) => i !== detailIndex
      );
      const updatedFormData = { ...state.formData, items: newItems };

      return {
        formData: updatedFormData,
      };
    }),

  updateItemDetail: (itemIndex, detailIndex, value) =>
    set((state) => {
      const newItems = [...state.formData.items];
      newItems[itemIndex].details[detailIndex] = value;
      const updatedFormData = { ...state.formData, items: newItems };

      return {
        formData: updatedFormData,
      };
    }),

  importJSON: (jsonData) => {
    set((state) => {
      const updatedFormData = {
        ...state.formData,
        ...jsonData,
        id: generateRandomString(10),
        items: jsonData.items ?? state.formData.items,
        invoiceFrom: jsonData.invoiceFrom ?? state.formData.invoiceFrom,
        invoiceTo: jsonData.invoiceTo ?? state.formData.invoiceTo,
      };

      return {
        formData: updatedFormData,
      };
    });
  },

  initializeInvoice: () => {
    const newInvoice = generateId(initialFormData);
    set({ formData: newInvoice });
  },

  getAllInvoices: () => loadInvoicesFromStorage(),

  getAllInvoicesAsync: async () => {
    try {
      return loadInvoicesFromStorage();
    } catch (error) {
      console.warn("Failed to load invoices from storage:", error);
      return [];
    }
  },

  isValidInvoice: () => {
    const formData = get().formData;
    return isInvoiceValid(formData);
  },

  saveInvoice: () => {
    const formData = get().formData;
    if (formData.id) {
      return saveInvoiceToArray(formData);
    }
    return false;
  },

  loadInvoice: (id: string) => {
    const invoice = findInvoiceById(id);
    if (invoice) {
      set({ formData: invoice });
      return true;
    }
    return false;
  },

  deleteInvoice: (id: string) => {
    deleteInvoicesFromStorage([id]);
  },

  bulkDeleteInvoices: (ids: Array<string>) => {
    deleteInvoicesFromStorage(ids);
  },

  duplicateInvoice: (id: string) => {
    const invoice = findInvoiceById(id);

    if (invoice) {
      const duplicatedInvoice = {
        ...invoice,
        id: generateRandomString(10),
        invoiceId: incrementCodeFlexible(invoice.invoiceId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        saveInvoiceToArray(duplicatedInvoice);
        set({ formData: duplicatedInvoice });
        return duplicatedInvoice.id;
      } catch (error) {
        console.error("Failed to duplicate invoice:", error);
        throw new Error("Failed to duplicate invoice", { cause: error });
      }
    }
    return null;
  },

  resetForm: () => set({ formData: initialFormData }),
}));

export const useInvoiceData = () => useInvoiceStore((state) => state.formData);

export const useInvoiceItems = () =>
  useInvoiceStore((state) => state.formData.items);

export const useInvoiceId = () =>
  useInvoiceStore((state) => state.formData.invoiceId);

export const useInvoiceDate = () =>
  useInvoiceStore((state) => state.formData.invoiceDate);

export const useInvoiceBankAccount = () =>
  useInvoiceStore((state) => state.formData.bankAccount);

export const useInvoiceFrom = () =>
  useInvoiceStore((state) => state.formData.invoiceFrom);

export const useInvoiceTo = () =>
  useInvoiceStore((state) => state.formData.invoiceTo);

export const useInvoiceCurrency = () =>
  useInvoiceStore((state) => state.formData.currency);

export const useInvoiceReduction = () =>
  useInvoiceStore((state) => state.formData.reductionAmount);

export const useInvoiceUpdateField = () =>
  useInvoiceStore((state) => state.updateField);

export const useInvoiceUpdateNestedField = () =>
  useInvoiceStore((state) => state.updateNestedField);

export const useInvoiceAddItem = () =>
  useInvoiceStore((state) => state.addItem);

export const useInvoiceDuplicateItem = () =>
  useInvoiceStore((state) => state.duplicateItem);

export const useInvoiceRemoveItem = () =>
  useInvoiceStore((state) => state.removeItem);

export const useInvoiceUpdateItem = () =>
  useInvoiceStore((state) => state.updateItem);

export const useInvoiceAddItemDetail = () =>
  useInvoiceStore((state) => state.addItemDetail);

export const useInvoiceRemoveItemDetail = () =>
  useInvoiceStore((state) => state.removeItemDetail);

export const useInvoiceUpdateItemDetail = () =>
  useInvoiceStore((state) => state.updateItemDetail);
