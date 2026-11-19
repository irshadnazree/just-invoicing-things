import {
  Button,
  ConfirmDialog,
  Input,
  Spinner,
} from "@irshadnazree/just-things-ui";
import { FileTextIcon, TrashIcon } from "@phosphor-icons/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import EmptyListView from "@/components/shared/history/empty-list-view";
import NoResultSection from "@/components/shared/history/no-result-view";
import TableView, {
  type TableColumn,
} from "@/components/shared/history/table-view";
import { PageHeader } from "@/components/shared/page-header";
import { calculateQuotationTotal, formatCurrency } from "@/lib/utils";
import { useQuotationStore } from "@/stores/quotation-store";
import type { QuotationFormData, QuotationListItem } from "@/types/quotation";

export const Route = createFileRoute("/quotation/")({
  component: RouteComponent,
});

function RouteComponent() {
  const getAllQuotations = useQuotationStore((state) => state.getAllQuotations);
  const getAllQuotationsAsync = useQuotationStore(
    (state) => state.getAllQuotationsAsync
  );
  const deleteQuotation = useQuotationStore((state) => state.deleteQuotation);
  const duplicateQuotation = useQuotationStore(
    (state) => state.duplicateQuotation
  );
  const bulkDeleteQuotations = useQuotationStore(
    (state) => state.bulkDeleteQuotations
  );
  const router = useRouter();

  const [quotations, setQuotations] = useState<QuotationFormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedQuotations, setSelectedQuotations] = useState<Set<string>>(
    new Set()
  );
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);

  const formattedQuotations = useMemo(
    () =>
      quotations.map((q) => {
        return {
          id: q.id,
          quotationId: q.quotationId,
          projectTitle: q.projectTitle || "Untitled Project",
          paymentType: q.paymentType.replace(" payment", ""),
          quotationFor: q.quotationFor?.company || "Unknown Company",
          quotationDate: q.quotationDate,
          total: calculateQuotationTotal(q),
          currency: q.currency || "RM",
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
        } satisfies QuotationListItem;
      }),
    [quotations]
  );

  const filteredQuotations = useMemo(() => {
    if (!searchTerm) {
      return formattedQuotations;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return formattedQuotations.filter(
      (q) =>
        q.projectTitle.toLowerCase().includes(lowerSearchTerm) ||
        q.quotationFor.toLowerCase().includes(lowerSearchTerm) ||
        q.quotationId.toLowerCase().includes(lowerSearchTerm)
    );
  }, [formattedQuotations, searchTerm]);

  const sortedQuotations = useMemo(
    () =>
      [...filteredQuotations].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [filteredQuotations]
  );

  function handleCreateQuotation() {
    router.navigate({
      to: "/quotation/$quotation",
      params: { quotation: "new" },
    });
  }

  function handleOpenQuotation(id: string) {
    router.navigate({
      to: "/quotation/$quotation",
      params: { quotation: id },
    });
  }

  const columns: TableColumn<QuotationListItem>[] = [
    {
      key: "quotationId",
      label: "No.",
      width: "w-36",
      cellClassName: "whitespace-nowrap",
      renderCell: (quotation) => (
        <Button
          className="jt-mono max-w-full justify-start"
          onClick={() => handleOpenQuotation(quotation.id)}
          title={quotation.quotationId || "No ID"}
          variant="link"
        >
          <span className="truncate">{quotation.quotationId || "No ID"}</span>
        </Button>
      ),
    },
    {
      key: "projectTitle",
      label: "Project",
      cellClassName: "min-w-0",
      renderCell: (quotation) => (
        <span className="block truncate" title={quotation.projectTitle}>
          {quotation.projectTitle}
        </span>
      ),
    },
    {
      key: "paymentType",
      label: "Payment",
      width: "w-28",
      cellClassName: "whitespace-nowrap",
      renderCell: (quotation) => quotation.paymentType,
    },
    {
      key: "quotationFor",
      label: "Client",
      cellClassName: "min-w-0",
      renderCell: (quotation) => (
        <span className="block truncate" title={quotation.quotationFor}>
          {quotation.quotationFor}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total",
      width: "w-40",
      cellClassName: "jt-mono whitespace-nowrap",
      numeric: true,
      renderCell: (quotation) =>
        formatCurrency(quotation.total, quotation.currency),
    },
  ];

  // A selection can't outlive the search that showed it, or bulk delete could hit hidden rows
  function handleSearch(value: string) {
    setSearchTerm(value);
    setSelectedQuotations(new Set());
  }

  function cancelDelete() {
    setPendingDeleteId(null);
  }

  function confirmDelete() {
    if (pendingDeleteId) {
      deleteQuotation(pendingDeleteId);
      setQuotations(getAllQuotations());
      setPendingDeleteId(null);
    }
  }

  function handleBulkDelete() {
    if (selectedQuotations.size > 0) {
      setPendingBulkDelete(true);
    }
  }

  function cancelBulkDelete() {
    setPendingBulkDelete(false);
  }

  function confirmBulkDelete() {
    bulkDeleteQuotations([...selectedQuotations]);
    setQuotations(getAllQuotations());
    setSelectedQuotations(new Set());
    setPendingBulkDelete(false);
  }

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        const loadedQuotations = await getAllQuotationsAsync();
        setQuotations(loadedQuotations);
      } catch (error) {
        console.error("Failed to load quotations:", error);
        setQuotations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuotations();
  }, [getAllQuotationsAsync]);

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex min-h-96 items-center justify-center">
          <Spinner label="Loading quotations" size="lg" />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <ConfirmDialog
        confirmLabel="Delete"
        description="This can't be undone."
        onConfirm={confirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            cancelDelete();
          }
        }}
        open={pendingDeleteId !== null}
        title="Delete this quotation?"
        tone="danger"
      />

      <ConfirmDialog
        confirmLabel={`Delete ${selectedQuotations.size}`}
        description="This can't be undone."
        onConfirm={confirmBulkDelete}
        onOpenChange={(open) => {
          if (!open) {
            cancelBulkDelete();
          }
        }}
        open={pendingBulkDelete}
        title={`Delete ${selectedQuotations.size} ${selectedQuotations.size === 1 ? "quotation" : "quotations"}?`}
        tone="danger"
      />

      <PageHeader
        actions={
          <>
            {selectedQuotations.size > 0 && (
              <Button onClick={handleBulkDelete} variant="danger">
                <TrashIcon size={16} />
                Delete {selectedQuotations.size}
              </Button>
            )}
            <Input
              aria-label="Search quotations"
              className="min-w-0 flex-1 sm:w-64 sm:flex-none"
              onValueChange={handleSearch}
              placeholder="Search quotations"
              type="search"
              value={searchTerm}
            />
            {quotations.length > 0 && (
              <Button onClick={handleCreateQuotation} variant="primary">
                <FileTextIcon size={16} weight="bold" />
                New quotation
              </Button>
            )}
          </>
        }
        title="Quotations"
      />

      {sortedQuotations.length === 0 && searchTerm !== "" && (
        <NoResultSection setSearchTerm={handleSearch} title="quotations" />
      )}
      {quotations.length === 0 && searchTerm === "" && (
        <EmptyListView
          handleCreate={handleCreateQuotation}
          title="quotations"
        />
      )}

      {sortedQuotations.length > 0 && (
        <TableView
          columns={columns}
          duplicateItem={duplicateQuotation}
          minWidthClassName="min-w-240"
          getItemLabel={(item) => item.quotationId || item.id}
          items={sortedQuotations}
          loadItems={getAllQuotationsAsync}
          openItem={handleOpenQuotation}
          setPendingDeleteId={setPendingDeleteId}
          setItems={setQuotations}
          setSelectedItems={setSelectedQuotations}
          selectedItems={selectedQuotations}
        />
      )}

      {sortedQuotations.length > 0 && (
        <p className="jt-muted text-sm">
          Showing {sortedQuotations.length} of {formattedQuotations.length}{" "}
          quotations
        </p>
      )}
    </section>
  );
}
