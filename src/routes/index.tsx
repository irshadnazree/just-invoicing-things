import { FileTextIcon, PlusIcon, ReceiptIcon } from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DocumentListItem,
  DocumentListItemSkeleton,
} from "@/components/dashboard/DocumentListItem";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TabFilter } from "@/components/dashboard/TabFilter";
import { Button } from "@/components/ui/Button";
import {
  calculateInvoiceTotal,
  calculateQuotationTotal,
  cn,
} from "@/lib/utils";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useQuotationStore } from "@/stores/quotation-store";
import type { InvoiceFormData } from "@/types/invoice";
import type { QuotationFormData } from "@/types/quotation";

type DocumentItem = {
  client: string;
  currency: string;
  date: string;
  documentId: string;
  id: string;
  total: number;
  type: "invoice" | "quotation";
  updatedAt: string;
};

const TABS = [
  { id: "all", label: "All" },
  { id: "invoices", label: "Invoices" },
  { id: "quotations", label: "Quotations" },
];

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const getAllInvoicesAsync = useInvoiceStore(
    (state) => state.getAllInvoicesAsync
  );
  const getAllQuotationsAsync = useQuotationStore(
    (state) => state.getAllQuotationsAsync
  );

  const [invoices, setInvoices] = useState<InvoiceFormData[]>([]);
  const [quotations, setQuotations] = useState<QuotationFormData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [loadedInvoices, loadedQuotations] = await Promise.all([
        getAllInvoicesAsync(),
        getAllQuotationsAsync(),
      ]);
      setInvoices(loadedInvoices);
      setQuotations(loadedQuotations);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setInvoices([]);
      setQuotations([]);
      setError("Failed to load your documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [getAllInvoicesAsync, getAllQuotationsAsync]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Combine and format documents
  const allDocuments: DocumentItem[] = useMemo(() => {
    const formattedInvoices: DocumentItem[] = invoices.map((invoice) => {
      return {
        id: invoice.id,
        documentId: invoice.invoiceId,
        client: invoice.invoiceTo?.company || "Unknown Company",
        date: invoice.invoiceDate,
        total: calculateInvoiceTotal(invoice),
        currency: invoice.currency || "RM",
        updatedAt: invoice.updatedAt,
        type: "invoice",
      };
    });

    const formattedQuotations: DocumentItem[] = quotations.map((quotation) => {
      return {
        id: quotation.id,
        documentId: quotation.quotationId,
        client: quotation.quotationFor?.company || "Unknown Company",
        date: quotation.quotationDate,
        total: calculateQuotationTotal(quotation),
        currency: quotation.currency || "RM",
        updatedAt: quotation.updatedAt,
        type: "quotation",
      };
    });

    return [...formattedInvoices, ...formattedQuotations].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [invoices, quotations]);

  // Filter documents based on active tab
  const filteredDocuments = useMemo(() => {
    switch (activeTab) {
      case "invoices":
        return allDocuments.filter((doc) => doc.type === "invoice");
      case "quotations":
        return allDocuments.filter((doc) => doc.type === "quotation");
      default:
        return allDocuments;
    }
  }, [allDocuments, activeTab]);

  // Get recent documents (last 5)
  const recentDocuments = useMemo(
    () => filteredDocuments.slice(0, 5),
    [filteredDocuments]
  );

  // Stats
  const invoiceCount = invoices.length;
  const quotationCount = quotations.length;
  const hasDocuments = invoiceCount > 0 || quotationCount > 0;

  // Handlers
  const handleNewInvoice = () => {
    navigate({ to: "/invoice/$invoice", params: { invoice: "new" } });
  };

  const handleNewQuotation = () => {
    navigate({ to: "/quotation/$quotation", params: { quotation: "new" } });
  };

  const handleViewInvoices = () => {
    navigate({ to: "/invoice" });
  };

  const handleViewQuotations = () => {
    navigate({ to: "/quotation" });
  };

  const isEmpty = !isLoading && !error && !hasDocuments;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        {!isEmpty && (
          <div className="flex gap-3">
            <Button
              icon={
                <ReceiptIcon className="size-4 xl:size-5" weight="duotone" />
              }
              onClick={handleNewInvoice}
              size="sm"
            >
              New Invoice
            </Button>
            <Button
              icon={
                <FileTextIcon className="size-4 xl:size-5" weight="duotone" />
              }
              onClick={handleNewQuotation}
              size="sm"
            >
              New Quotation
            </Button>
          </div>
        )}
      </section>

      {!isLoading && error && (
        <section className="flex flex-col items-center justify-center gap-4 border border-dashed border-error/40 bg-error/5 py-16 text-center">
          <div
            className={cn(
              "flex size-16 items-center justify-center rounded-full",
              "bg-error/10 text-error"
            )}
          >
            <FileTextIcon className="size-8" weight="duotone" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-text">
              Unable to load dashboard
            </h2>
            <p className="text-muted">{error}</p>
          </div>
          <Button onClick={() => void loadData()} size="sm">
            Try Again
          </Button>
        </section>
      )}

      {/* Empty State */}
      {isEmpty && (
        <section className="flex flex-col items-center justify-center gap-6 border border-dashed border-text/30 bg-foreground/30 px-6 py-16">
          <div className="flex size-16 items-center justify-center bg-foreground/50">
            <PlusIcon className="size-8 text-muted" weight="duotone" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-text">Welcome!</h2>
            <p className="mt-2 text-muted">
              Create your first invoice or quotation to get started.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              icon={<ReceiptIcon className="size-4" weight="duotone" />}
              onClick={handleNewInvoice}
              size="sm"
            >
              New Invoice
            </Button>
            <Button
              icon={<FileTextIcon className="size-4" weight="duotone" />}
              onClick={handleNewQuotation}
              size="sm"
            >
              New Quotation
            </Button>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {(isLoading || (!error && hasDocuments)) && (
        <section className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg text-text">Quick Overview</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
            <StatsCard
              count={invoiceCount}
              icon={<ReceiptIcon className="size-6" weight="duotone" />}
              isLoading={isLoading}
              label="Invoices"
              onClick={handleViewInvoices}
            />
            <StatsCard
              count={quotationCount}
              icon={<FileTextIcon className="size-6" weight="duotone" />}
              isLoading={isLoading}
              label="Quotations"
              onClick={handleViewQuotations}
            />
          </div>
        </section>
      )}

      {/* Recent Documents Section */}
      {(isLoading || (!error && hasDocuments)) && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-lg text-text">
              Recent Documents
            </h2>
            <TabFilter
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={TABS}
            />
          </div>

          {/* Document List */}
          <div className="flex flex-col gap-2">
            {isLoading ? (
              // Skeleton loading state
              <>
                <DocumentListItemSkeleton />
                <DocumentListItemSkeleton />
                <DocumentListItemSkeleton />
                <DocumentListItemSkeleton />
                <DocumentListItemSkeleton />
              </>
            ) : recentDocuments.length > 0 ? (
              // Document list
              recentDocuments.map((doc) => (
                <DocumentListItem
                  client={doc.client}
                  currency={doc.currency}
                  date={doc.date}
                  documentId={doc.documentId}
                  id={doc.id}
                  key={`${doc.type}-${doc.id}`}
                  total={doc.total}
                  type={doc.type}
                  updatedAt={doc.updatedAt}
                />
              ))
            ) : (
              // No documents for this filter
              <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-text/20 bg-foreground/30 py-12 text-center">
                <p className="text-muted">
                  No{" "}
                  {activeTab === "all"
                    ? "documents"
                    : activeTab === "invoices"
                      ? "invoices"
                      : "quotations"}{" "}
                  found.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
