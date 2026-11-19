import {
  Button,
  ConfirmDialog,
  Input,
  Spinner,
} from "@irshadnazree/just-things-ui";
import { ReceiptIcon, TrashIcon } from "@phosphor-icons/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import EmptyListView from "@/components/shared/history/empty-list-view";
import NoResultSection from "@/components/shared/history/no-result-view";
import TableView, {
  type TableColumn,
} from "@/components/shared/history/table-view";
import { PageHeader } from "@/components/shared/page-header";
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
      label: "No.",
      width: "w-36",
      cellClassName: "whitespace-nowrap",
      renderCell: (invoice) => (
        <Button
          className="jt-mono max-w-full justify-start"
          onClick={() => handleOpenInvoice(invoice.id)}
          title={invoice.invoiceId || "No ID"}
          variant="link"
        >
          <span className="truncate">{invoice.invoiceId || "No ID"}</span>
        </Button>
      ),
    },
    {
      key: "invoiceDate",
      label: "Date",
      width: "w-32",
      cellClassName: "whitespace-nowrap",
      renderCell: (invoice) => invoice.invoiceDate,
    },
    {
      key: "invoiceFor",
      label: "Client",
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
      width: "w-40",
      cellClassName: "jt-mono whitespace-nowrap",
      numeric: true,
      renderCell: (invoice) => formatCurrency(invoice.total, invoice.currency),
    },
  ];

  // A selection can't outlive the search that showed it, or bulk delete could hit hidden rows
  function handleSearch(value: string) {
    setSearchTerm(value);
    setSelectedInvoices(new Set());
  }

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
          <Spinner label="Loading invoices" size="lg" />
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
        title="Delete this invoice?"
        tone="danger"
      />

      <ConfirmDialog
        confirmLabel={`Delete ${selectedInvoices.size}`}
        description="This can't be undone."
        onConfirm={confirmBulkDelete}
        onOpenChange={(open) => {
          if (!open) {
            cancelBulkDelete();
          }
        }}
        open={pendingBulkDelete}
        title={`Delete ${selectedInvoices.size} ${selectedInvoices.size === 1 ? "invoice" : "invoices"}?`}
        tone="danger"
      />

      <PageHeader
        actions={
          <>
            {selectedInvoices.size > 0 && (
              <Button onClick={handleBulkDelete} variant="danger">
                <TrashIcon size={16} />
                Delete {selectedInvoices.size}
              </Button>
            )}
            <Input
              aria-label="Search invoices"
              className="min-w-0 flex-1 sm:w-64 sm:flex-none"
              onValueChange={handleSearch}
              placeholder="Search invoices"
              type="search"
              value={searchTerm}
            />
            {invoices.length > 0 && (
              <Button onClick={handleCreateInvoice} variant="primary">
                <ReceiptIcon size={16} weight="bold" />
                New invoice
              </Button>
            )}
          </>
        }
        title="Invoices"
      />

      {sortedInvoices.length === 0 && searchTerm !== "" && (
        <NoResultSection setSearchTerm={handleSearch} title="invoices" />
      )}
      {invoices.length === 0 && searchTerm === "" && (
        <EmptyListView handleCreate={handleCreateInvoice} title="invoices" />
      )}

      {sortedInvoices.length > 0 && (
        <TableView
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
        <p className="jt-muted text-sm">
          Showing {sortedInvoices.length} of {formattedInvoices.length} invoices
        </p>
      )}
    </section>
  );
}
