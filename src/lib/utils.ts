import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export function sanitizeFilename(str: string) {
  return str
    .replaceAll(/[^a-z0-9]/gi, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "")
    .toUpperCase();
}

export function formatCurrency(
  amount: number,
  currencySymbol: string,
  decimals = 2
) {
  return `${currencySymbol} ${amount.toFixed(decimals)}`;
}

export function formatDecimal(amount: number, decimals = 2) {
  return amount.toFixed(decimals);
}

type PricedItem = {
  quantity: number;
  rate: number;
};

function calculateItemsTotal(items: Array<PricedItem>) {
  return items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
}

export function calculateInvoiceTotal(invoice: {
  items: Array<PricedItem>;
  reductionAmount?: number;
}) {
  return calculateItemsTotal(invoice.items) - (invoice.reductionAmount || 0);
}

export function calculateQuotationTotal(quotation: {
  items: Array<PricedItem>;
}) {
  return calculateItemsTotal(quotation.items);
}

export function downloadFile(
  content: string | Blob,
  filename: string,
  type = "application/json"
) {
  const blob =
    typeof content === "string" ? new Blob([content], { type }) : content;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportJSON(data: unknown, filename: string) {
  const dataStr = JSON.stringify(data, null, 2);
  downloadFile(dataStr, filename, "application/json");
}

// oxlint-disable-next-line quality/no-unknown-returns -- callers own the shape of the imported JSON
export async function readJsonFile(file: File): Promise<unknown> {
  try {
    const jsonData = JSON.parse(await file.text()) as unknown;
    return jsonData;
  } catch {
    throw new Error("Failed to parse JSON file. Please check the file format.");
  }
}

export function generatePrintFilename(
  fromCompany: string,
  toCompany: string,
  documentId: string
) {
  const sanitizedFromCompany = sanitizeFilename(
    fromCompany.split(" ")[0] || ""
  );
  const sanitizedToCompany = sanitizeFilename(toCompany.split(" ")[0] || "");
  const sanitizedDocumentId = sanitizeFilename(documentId);

  return `${sanitizedDocumentId}-${sanitizedFromCompany}-${sanitizedToCompany}`;
}
