import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type {
  QuotationFormData,
  QuotationLineItem,
  QuotationStore,
} from "@/types/quotation";
import {
  generateRandomString,
  incrementCodeFlexible,
} from "@/utils/id-helpers";
import {
  deleteQuotationsFromStorage,
  findQuotationById,
  generateId,
  isQuotationValid,
  loadQuotationsFromStorage,
  saveQuotationToArray,
} from "@/utils/quotation";

export const initialFormData: QuotationFormData = {
  id: "",
  createdAt: "",
  updatedAt: "",
  quotationId: "",
  quotationDate: "",
  bankAccount: "",
  quotationFrom: {
    company: "",
  },
  quotationFor: {
    company: "",
  },
  projectTitle: "",
  paymentType: "",
  items: [],
  currency: "",
  depositPercent: 0,
  hasSecondPayment: false,
  secondPaymentPercent: 0,
  terms: [],
};

export const useQuotationStore = create<QuotationStore>((set, get) => ({
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
            quantity: 1,
            rate: 550,
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
      const duplicatedItem: QuotationLineItem = {
        name: itemToDuplicate.name,
        details: [...itemToDuplicate.details],
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
      const newItems = state.formData.items.map((item, index) =>
        index === itemIndex ? { ...item, details: [...item.details, ""] } : item
      );
      const updatedFormData = { ...state.formData, items: newItems };

      return {
        formData: updatedFormData,
      };
    }),

  removeItemDetail: (itemIndex, detailIndex) =>
    set((state) => {
      const newItems = state.formData.items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              details: item.details.filter((_, i) => i !== detailIndex),
            }
          : item
      );
      const updatedFormData = { ...state.formData, items: newItems };

      return {
        formData: updatedFormData,
      };
    }),

  updateItemDetail: (itemIndex, detailIndex, value) =>
    set((state) => {
      const newItems = state.formData.items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              details: item.details.map((detail, i) =>
                i === detailIndex ? value : detail
              ),
            }
          : item
      );
      const updatedFormData = { ...state.formData, items: newItems };

      return {
        formData: updatedFormData,
      };
    }),

  addTerm: () =>
    set((state) => {
      const updatedFormData = {
        ...state.formData,
        terms: [...state.formData.terms, ""],
      };

      return {
        formData: updatedFormData,
      };
    }),

  duplicateTerm: (index) =>
    set((state) => {
      const termToDuplicate = state.formData.terms[index];
      const newTerms = [...state.formData.terms];
      newTerms.splice(index + 1, 0, termToDuplicate);
      const updatedFormData = {
        ...state.formData,
        terms: newTerms,
      };

      return {
        formData: updatedFormData,
      };
    }),

  removeTerm: (index) =>
    set((state) => {
      const updatedFormData = {
        ...state.formData,
        terms: state.formData.terms.filter((_, i) => i !== index),
      };

      return {
        formData: updatedFormData,
      };
    }),
  updateTerm: (index, value) =>
    set((state) => {
      const newTerms = [...state.formData.terms];
      newTerms[index] = value;
      const updatedFormData = { ...state.formData, terms: newTerms };

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
        quotationFrom: jsonData.quotationFrom ?? state.formData.quotationFrom,
        quotationFor: jsonData.quotationFor ?? state.formData.quotationFor,
      };

      return {
        formData: updatedFormData,
      };
    });
  },

  initializeQuotation: () => {
    const newQuotation = generateId(initialFormData);
    set({ formData: newQuotation });
  },

  getAllQuotations: () => loadQuotationsFromStorage(),

  getAllQuotationsAsync: async () => {
    try {
      return loadQuotationsFromStorage();
    } catch (error) {
      console.warn("Failed to load quotations from storage:", error);
      return [];
    }
  },

  isValidQuotation: () => {
    const formData = get().formData;
    return isQuotationValid(formData);
  },

  saveQuotation: () => {
    const formData = get().formData;
    if (formData.id) {
      return saveQuotationToArray(formData);
    }
    return false;
  },

  loadQuotation: (id: string) => {
    const quotation = findQuotationById(id);
    if (quotation) {
      set({ formData: quotation });
      return true;
    }
    return false;
  },

  deleteQuotation: (id: string) => {
    deleteQuotationsFromStorage([id]);
  },

  bulkDeleteQuotations: (ids: Array<string>) => {
    deleteQuotationsFromStorage(ids);
  },

  duplicateQuotation: (id: string) => {
    const quotation = findQuotationById(id);

    if (quotation) {
      const duplicatedQuotation = {
        ...quotation,
        id: generateRandomString(10),
        quotationId: incrementCodeFlexible(quotation.quotationId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        saveQuotationToArray(duplicatedQuotation);
        set({ formData: duplicatedQuotation });
        return duplicatedQuotation.id;
      } catch (error) {
        console.error("Failed to duplicate quotation:", error);
        throw new Error("Failed to duplicate quotation", { cause: error });
      }
    }
    return null;
  },

  resetForm: () => set({ formData: initialFormData }),
}));

export const useQuotationData = () =>
  useQuotationStore((state) => state.formData);

export const useQuotationItems = () =>
  useQuotationStore((state) => state.formData.items);

export const useQuotationTerms = () =>
  useQuotationStore((state) => state.formData.terms);

export const useProjectTitle = () =>
  useQuotationStore((state) => state.formData.projectTitle);

export const useQuotationId = () =>
  useQuotationStore((state) => state.formData.quotationId);

export const useQuotationDate = () =>
  useQuotationStore((state) => state.formData.quotationDate);

export const useBankAccount = () =>
  useQuotationStore((state) => state.formData.bankAccount);

export const useQuotationFrom = () =>
  useQuotationStore((state) => state.formData.quotationFrom);

export const useQuotationFor = () =>
  useQuotationStore((state) => state.formData.quotationFor);

export const useQuotationPaymentConfig = () => {
  return useQuotationStore(
    useShallow((state) => ({
      paymentType: state.formData.paymentType,
      depositPercent: state.formData.depositPercent,
      hasSecondPayment: state.formData.hasSecondPayment,
      secondPaymentPercent: state.formData.secondPaymentPercent,
      currency: state.formData.currency,
    }))
  );
};

export const useUpdateField = () =>
  useQuotationStore((state) => state.updateField);

export const useUpdateNestedField = () =>
  useQuotationStore((state) => state.updateNestedField);

export const useAddItem = () => useQuotationStore((state) => state.addItem);

export const useDuplicateItem = () =>
  useQuotationStore((state) => state.duplicateItem);

export const useRemoveItem = () =>
  useQuotationStore((state) => state.removeItem);

export const useUpdateItem = () =>
  useQuotationStore((state) => state.updateItem);

export const useAddItemDetail = () =>
  useQuotationStore((state) => state.addItemDetail);

export const useRemoveItemDetail = () =>
  useQuotationStore((state) => state.removeItemDetail);

export const useUpdateItemDetail = () =>
  useQuotationStore((state) => state.updateItemDetail);

export const useAddTerm = () => useQuotationStore((state) => state.addTerm);

export const useDuplicateTerm = () =>
  useQuotationStore((state) => state.duplicateTerm);

export const useRemoveTerm = () =>
  useQuotationStore((state) => state.removeTerm);

export const useUpdateTerm = () =>
  useQuotationStore((state) => state.updateTerm);
