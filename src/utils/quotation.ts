import type { QuotationFormData } from "@/types/quotation";
import { generateRandomString, getNextDisplayId } from "@/utils/id-helpers";
import {
  findItemById,
  loadFromStorage,
  saveItemToArray,
  saveToStorage,
} from "@/utils/storage-helpers";

const STORAGE_KEY = "quotations";
const currentYear = new Date().getFullYear();
const DEFAULT_QUOTATION_ID = `QUO-${currentYear}-001`;

export function generateId(formData: QuotationFormData): QuotationFormData {
  const today = new Date().toISOString().split("T")[0];

  const existingQuotations = loadQuotationsFromStorage();
  const nextQuotationId =
    formData.quotationId ||
    getNextDisplayId(
      existingQuotations,
      (quotation) => quotation.quotationId,
      DEFAULT_QUOTATION_ID
    );

  return {
    ...formData,
    id: formData.id || generateRandomString(10),
    quotationId: nextQuotationId,
    quotationDate: formData.quotationDate || today,
  };
}

export function loadQuotationsFromStorage(): Array<QuotationFormData> {
  return loadFromStorage<QuotationFormData>(STORAGE_KEY);
}

export function saveQuotationsToStorage(
  quotations: Array<QuotationFormData>
): void {
  saveToStorage(STORAGE_KEY, quotations);
}

export function findQuotationById(id: string): QuotationFormData | null {
  return findItemById<QuotationFormData>(STORAGE_KEY, id);
}

export function deleteQuotationsFromStorage(ids: Array<string>): void {
  const idsToDelete = new Set(ids);
  const quotations = loadQuotationsFromStorage();
  const filteredQuotations = quotations.filter((q) => !idsToDelete.has(q.id));
  saveQuotationsToStorage(filteredQuotations);
}

export function isQuotationValid(quotationData: QuotationFormData): boolean {
  const hasQuotationId = quotationData.quotationId.trim() !== "";
  const hasProjectTitle = quotationData.projectTitle.trim() !== "";

  return hasQuotationId && hasProjectTitle;
}

export function saveQuotationToArray(
  quotationData: QuotationFormData
): boolean {
  return saveItemToArray(STORAGE_KEY, quotationData, isQuotationValid);
}
