import type { QuotationLineItem } from "@/types/quotation";

export function getTotalByCurrency(lineItems: Array<QuotationLineItem>) {
  const totals: Record<string, number> = {};
  for (const item of lineItems) {
    const itemCurrency = item.currency;
    totals[itemCurrency] =
      (totals[itemCurrency] || 0) + item.quantity * item.rate;
  }
  return totals;
}

export function getDepositByCurrency(
  paymentType: string,
  depositPercent: number,
  currencyTotals: Record<string, number>
) {
  if (paymentType === "Recurring payment") {
    return {};
  }

  const deposits: Record<string, number> = {};
  for (const [itemCurrency, total] of Object.entries(currencyTotals)) {
    deposits[itemCurrency] = (total * depositPercent) / 100;
  }
  return deposits;
}

export function getSecondPaymentByCurrency(
  hasSecondPayment: boolean,
  secondPaymentPercent: number,
  currencyTotals: Record<string, number>
) {
  if (!hasSecondPayment) {
    return {};
  }
  const secondPayments: Record<string, number> = {};
  for (const [currency, total] of Object.entries(currencyTotals)) {
    secondPayments[currency] = (total * secondPaymentPercent) / 100;
  }
  return secondPayments;
}

export function getFinalPaymentByCurrency(
  currencyTotals: Record<string, number>,
  currencyDeposits: Record<string, number>,
  currencySecondPayments: Record<string, number>
) {
  const finalPayments: Record<string, number> = {};
  for (const [currency, total] of Object.entries(currencyTotals)) {
    const deposit = currencyDeposits[currency] || 0;
    const secondPayment = currencySecondPayments[currency] || 0;
    finalPayments[currency] = total - deposit - secondPayment;
  }
  return finalPayments;
}
