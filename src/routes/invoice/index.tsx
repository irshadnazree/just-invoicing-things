import { Receipt, TrashIcon } from "@phosphor-icons/react";
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
import { calculateInvoiceTotal, formatCurrency } from "@/lib/utils";
import { initialFormData, useInvoiceStore } from "@/stores/invoice-store";
import type { InvoiceFormData, InvoiceListItem } from "@/types/invoice";
import { generateId } from "@/utils/invoice";

export const Route = createFileRoute("/invoice/")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    bulkDeleteInvoices,
    deleteInvoice,
    duplicateInvoice,
    getAllInvoices,
    getAllInvoicesAsync,
  } = useInvoiceStore();
  const router = useRouter();

  const [invoices, setInvoices] = useState<InvoiceFormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set()
  );
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);

  const formattedInvoices = useMemo(
    () =>
      invoices.map((invoice) => {
        return {
          id: invoice.id,
          invoiceId: invoice.invoiceId,
          invoiceFor: invoice.invoiceTo?.company || "Unknown Company",
          invoiceDate: invoice.invoiceDate,
          total: calculateInvoiceTotal(invoice),
          currency: invoice.currency || "RM",
          createdAt: invoice.createdAt,
          updatedAt: invoice.updatedAt,
        } satisfies InvoiceListItem;
      }),
    [invoices]
  );

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) {
      return formattedInvoices;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return formattedInvoices.filter(
      (invoice) =>
        invoice.invoiceFor.toLowerCase().includes(lowerSearchTerm) ||
        invoice.invoiceId.toLowerCase().includes(lowerSearchTerm)
    );
  }, [formattedInvoices, searchTerm]);

  const sortedInvoices = useMemo(
    () =>
      [...filteredInvoices].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [filteredInvoices]
  );

  function handleCreateInvoice() {
    const newInvoice = generateId(initialFormData as InvoiceFormData);

    handleOpenInvoice(newInvoice.id);
  }

  function handleOpenInvoice(id: string) {
    router.navigate({
      to: "/invoice/$invoice",
      params: { invoice: id },
    });
  }

  const columns: TableColumn<InvoiceListItem>[] = [
    {
      key: "invoiceId",
      label: "Id",
      width: "w-[15%]",
      cellClassName: "whitespace-nowrap font-medium tabular-nums",
      renderCell: (invoice) => (
        <button
          className="block max-w-full cursor-pointer truncate text-primary transition-opacity hover:opacity-80 tabular-nums"
          onClick={() => handleOpenInvoice(invoice.id)}
          title={invoice.invoiceId || "No ID"}
          type="button"
        >
          {invoice.invoiceId || "No ID"}
        </button>
      ),
    },
    {
      key: "invoiceDate",
      label: "Date",
      width: "w-[15%]",
      cellClassName: "whitespace-nowrap",
      renderCell: (invoice) => invoice.invoiceDate,
    },
    {
      key: "invoiceFor",
      label: "Client",
      width: "w-[40%]",
      cellClassName: "min-w-0",
      renderCell: (invoice) => (
        <span className="block truncate" title={invoice.invoiceFor}>
          {invoice.invoiceFor}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total",
      width: "w-[15%]",
      cellClassName: "whitespace-nowrap tabular-nums",
      renderCell: (invoice) => formatCurrency(invoice.total, invoice.currency),
    },
  ];

  function cancelDelete() {
    setPendingDeleteId(null);
  }

  function confirmDelete() {
    if (pendingDeleteId) {
      deleteInvoice(pendingDeleteId);
      setInvoices(getAllInvoices());
      setPendingDeleteId(null);
    }
  }

  function handleBulkDelete() {
    if (selectedInvoices.size > 0) {
      setPendingBulkDelete(true);
    }
  }

  function cancelBulkDelete() {
    setPendingBulkDelete(false);
  }

  function confirmBulkDelete() {
    bulkDeleteInvoices([...selectedInvoices]);
    setInvoices(getAllInvoices());
    setSelectedInvoices(new Set());
    setPendingBulkDelete(false);
  }

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const loadedInvoices = await getAllInvoicesAsync();
        setInvoices(loadedInvoices);
      } catch (error) {
        console.error("Failed to load invoices:", error);
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, [getAllInvoicesAsync]);

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex min-h-96 items-center justify-center">
          <Loader text="Loading invoices..." />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <ConfirmationDialog
        confirmLabel="Delete"
        description="Are you sure you want to delete this invoice?"
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
        confirmLabel={`Delete ${selectedInvoices.size} Item(s)`}
        description={`Are you sure you want to delete ${selectedInvoices.size} invoice(s)?`}
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
          <h1 className="text-3xl font-bold">Invoices</h1>
          {invoices.length > 0 && (
            <Button
              icon={<Receipt className="size-4 xl:size-5" weight="duotone" />}
              onClick={handleCreateInvoice}
              size="sm"
            >
              New Invoice
            </Button>
          )}
        </div>
        <div className="flex w-full items-center gap-4 md:w-auto">
          {selectedInvoices.size > 0 && (
            <Button
              aria-label="Delete selected"
              icon={<TrashIcon className="size-4 xl:size-5" size={20} />}
              onClick={handleBulkDelete}
              size="sm"
              variant="ghost"
            />
          )}

          <label className="sr-only" htmlFor="search">
            Search invoices
          </label>
          <Input
            id="search"
            onChange={(value) => setSearchTerm(value as string)}
            placeholder="Search invoices..."
            type="text"
            value={searchTerm}
          />
        </div>
      </div>

      {sortedInvoices.length === 0 && searchTerm !== "" && (
        <NoResultSection setSearchTerm={setSearchTerm} title="invoices" />
      )}
      {invoices.length === 0 && searchTerm === "" && (
        <EmptyListView handleCreate={handleCreateInvoice} title="invoices" />
      )}

      {sortedInvoices.length > 0 && (
        <TableView
          actionColumnWidth="w-[15%]"
          columns={columns}
          duplicateItem={duplicateInvoice}
          getItemLabel={(item) => item.invoiceId || item.id}
          items={sortedInvoices}
          loadItems={getAllInvoicesAsync}
          openItem={handleOpenInvoice}
          setItems={setInvoices}
          setPendingDeleteId={setPendingDeleteId}
          setSelectedItems={setSelectedInvoices}
          selectedItems={selectedInvoices}
        />
      )}

      {sortedInvoices.length > 0 && (
        <div className="mt-4 text-sm text-text">
          Showing {sortedInvoices.length} of {formattedInvoices.length} invoices
        </div>
      )}
    </section>
  );
}
