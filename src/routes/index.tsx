import { Button, EmptyState, Surface } from "@irshadnazree/just-things-ui";
import {
  FileTextIcon,
  PlusIcon,
  ReceiptIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DocumentListItem,
  DocumentListItemSkeleton,
} from "@/components/dashboard/DocumentListItem";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TabFilter } from "@/components/dashboard/TabFilter";
import { PageHeader } from "@/components/shared/page-header";
import { calculateInvoiceTotal, calculateQuotationTotal } from "@/lib/utils";
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
] as const;

type TabId = (typeof TABS)[number]["id"];

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
  const [activeTab, setActiveTab] = useState<TabId>("all");

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

  const newDocumentActions = (
    <>
      <Button onClick={handleNewQuotation}>
        <FileTextIcon size={16} weight="duotone" />
        New quotation
      </Button>
      <Button onClick={handleNewInvoice} variant="primary">
        <ReceiptIcon size={16} weight="duotone" />
        New invoice
      </Button>
    </>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader actions={!isEmpty && newDocumentActions} title="Dashboard" />

      {!isLoading && error && (
        <Surface variant="dashed">
          <EmptyState
            actions={
              <Button onClick={() => void loadData()} variant="primary">
                Try again
              </Button>
            }
            description={error}
            icon={
              <WarningCircleIcon
                className="text-bad"
                size={40}
                weight="duotone"
              />
            }
            title="Unable to load the dashboard"
          />
        </Surface>
      )}

      {isEmpty && (
        <Surface variant="dashed">
          <EmptyState
            actions={newDocumentActions}
            description="Create your first invoice or quotation to get started."
            icon={<PlusIcon size={40} weight="duotone" />}
            title="Welcome"
          />
        </Surface>
      )}

      {(isLoading || (!error && hasDocuments)) && (
        <section className="flex flex-col gap-3">
          <h2 className="jt-label">Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatsCard
              count={invoiceCount}
              icon={<ReceiptIcon size={24} weight="duotone" />}
              isLoading={isLoading}
              label="Invoices"
              onClick={handleViewInvoices}
            />
            <StatsCard
              count={quotationCount}
              icon={<FileTextIcon size={24} weight="duotone" />}
              isLoading={isLoading}
              label="Quotations"
              onClick={handleViewQuotations}
            />
          </div>
        </section>
      )}

      {(isLoading || (!error && hasDocuments)) && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="jt-label">Recent documents</h2>
            <TabFilter
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={TABS}
            />
          </div>

          <div className="flex flex-col gap-2">
            {isLoading ? (
              <>
                <DocumentListItemSkeleton />
                <DocumentListItemSkeleton />
                <DocumentListItemSkeleton />
                <DocumentListItemSkeleton />
                <DocumentListItemSkeleton />
              </>
            ) : recentDocuments.length > 0 ? (
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
              <Surface className="jt-muted py-10 text-center" variant="dashed">
                No {activeTab === "all" ? "documents" : activeTab} yet.
              </Surface>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
