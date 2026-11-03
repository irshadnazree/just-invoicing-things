import { FileText, TrashIcon } from "@phosphor-icons/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import EmptyListView from "@/components/shared/history/empty-list-view";
import NoResultSection from "@/components/shared/history/no-result-view";
import TableView, {
  type TableColumn,
} from "@/components/shared/history/table-view";
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
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
      label: "Id",
      width: "w-[12%]",
      cellClassName: "whitespace-nowrap font-medium tabular-nums",
      renderCell: (quotation) => (
        <button
          className="block max-w-full cursor-pointer truncate text-primary-text transition-opacity hover:opacity-80 tabular-nums"
          onClick={() => handleOpenQuotation(quotation.id)}
          title={quotation.quotationId || "No ID"}
          type="button"
        >
          {quotation.quotationId || "No ID"}
        </button>
      ),
    },
    {
      key: "projectTitle",
      label: "Project",
      width: "w-[32%]",
      cellClassName: "min-w-0",
      renderCell: (quotation) => (
        <span className="block truncate" title={quotation.projectTitle}>
          {quotation.projectTitle}
        </span>
      ),
    },
    {
      key: "paymentType",
      label: "Payment Type",
      width: "w-[12%]",
      cellClassName: "whitespace-nowrap",
      renderCell: (quotation) => quotation.paymentType,
    },
    {
      key: "quotationFor",
      label: "Client",
      width: "w-[18%]",
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
      width: "w-[10%]",
      cellClassName: "whitespace-nowrap tabular-nums",
      renderCell: (quotation) =>
        formatCurrency(quotation.total, quotation.currency),
    },
  ];

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
          <Loader text="Loading quotations..." />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <ConfirmationDialog
        confirmLabel="Delete"
        description="Are you sure you want to delete this quotation?"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        open={pendingDeleteId !== null}
        title="Confirm Delete"
        variant="warning"
        onOpenChange={(open) => {
          if (!open) {
            cancelDelete();
          }
        }}
      />

      <ConfirmationDialog
        confirmLabel={`Delete ${selectedQuotations.size} Item(s)`}
        description={`Are you sure you want to delete ${selectedQuotations.size} quotation(s)?`}
        onCancel={cancelBulkDelete}
        onConfirm={confirmBulkDelete}
        open={pendingBulkDelete}
        title="Confirm Bulk Delete"
        variant="warning"
        onOpenChange={(open) => {
          if (!open) {
            cancelBulkDelete();
          }
        }}
      />

      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-0">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Quotations</h1>
          {quotations.length > 0 && (
            <Button
              icon={<FileText className="size-4 xl:size-5" weight="duotone" />}
              onClick={handleCreateQuotation}
              size="sm"
            >
              New Quotation
            </Button>
          )}
        </div>
        <div className="flex w-full items-center gap-4 md:w-auto">
          {selectedQuotations.size > 0 && (
            <Button
              aria-label="Delete selected"
              icon={<TrashIcon className="size-4 xl:size-5" size={20} />}
              onClick={handleBulkDelete}
              size="sm"
              variant="ghost"
            />
          )}

          <label className="sr-only" htmlFor="search">
            Search quotations
          </label>
          <Input
            id="search"
            onChange={(value) => setSearchTerm(value as string)}
            placeholder="Search quotations..."
            type="text"
            value={searchTerm}
          />
        </div>
      </div>

      {sortedQuotations.length === 0 && searchTerm !== "" && (
        <NoResultSection setSearchTerm={setSearchTerm} title="quotations" />
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
        <div className="mt-4 text-sm text-text">
          Showing {sortedQuotations.length} of {formattedQuotations.length}{" "}
          quotations
        </div>
      )}
    </section>
  );
}
