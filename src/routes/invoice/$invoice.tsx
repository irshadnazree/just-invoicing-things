import { Button, ConfirmDialog, useToast } from "@irshadnazree/just-things-ui";
import {
  ArrowUUpLeftIcon,
  DownloadIcon,
  EyeIcon,
  UploadIcon,
} from "@phosphor-icons/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useNavigationWarning } from "@/components/hooks/use-navigation-warning";
import FormWrapper from "@/components/page/invoice/form-wrapper";
import { PageHeader } from "@/components/shared/page-header";
import { SaveStatus } from "@/components/shared/save-status";
import { exportJSON, readJsonFile } from "@/lib/utils";
import { useInvoiceStore } from "@/stores/invoice-store";
import { isInvoiceValid } from "@/utils/invoice";

export const Route = createFileRoute("/invoice/$invoice")({
  loader: ({ params: { invoice } }) => ({ invoiceId: invoice }),
  component: RouteComponent,
});

function RouteComponent() {
  const { invoiceId } = Route.useLoaderData();
  const router = useRouter();
  const { add } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasPendingSave = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  const { formData, importJSON, loadInvoice, initializeInvoice, saveInvoice } =
    useInvoiceStore();

  // Check if form has unsaved changes (has some data but not valid/saved)
  const hasUnsavedChanges = Boolean(
    formData.id &&
    formData.id !== "" &&
    !isInvoiceValid(formData) &&
    (formData.invoiceFrom.company.trim() !== "" ||
      formData.invoiceTo.company.trim() !== "" ||
      formData.bankAccount.trim() !== "" ||
      formData.reductionAmount !== 0 ||
      formData.items.length > 0)
  );

  // Setup navigation warning
  const {
    isDialogOpen,
    confirmNavigation,
    cancelNavigation,
    title,
    description,
    confirmLabel,
    cancelLabel,
  } = useNavigationWarning({
    enabled: hasUnsavedChanges,
    allowedPaths: ["/invoice/preview"],
    title: "Unsaved changes",
    description:
      "You have started filling out this invoice but haven't saved it yet. If you leave now, your progress will be lost.",
    confirmLabel: "Leave",
    cancelLabel: "Stay",
  });

  // Load invoice on component mount
  useEffect(() => {
    // Persist the previous invoice's last edits before replacing it in the store
    if (hasPendingSave.current) {
      hasPendingSave.current = false;
      saveInvoice();
    }
    if (invoiceId === "new") {
      // Create new invoice
      initializeInvoice();
    } else {
      // An unsaved draft is only in memory, so keep it rather than reloading from storage
      if (useInvoiceStore.getState().formData.id === invoiceId) {
        return;
      }
      // Try to load existing invoice
      const loaded = loadInvoice(invoiceId);
      if (!loaded) {
        // Invoice not found, redirect to create new
        initializeInvoice();
        router.navigate({
          to: "/invoice/$invoice",
          params: { invoice: "new" },
        });
      }
    }
  }, [invoiceId, loadInvoice, initializeInvoice, router, saveInvoice]);

  // Auto-save when form data changes with debounce
  useEffect(() => {
    if (!formData.id || !isInvoiceValid(formData)) {
      setIsSaving(false);
      return;
    }

    setIsSaving(true);
    hasPendingSave.current = true;

    const timeoutId = setTimeout(() => {
      hasPendingSave.current = false;
      const success = saveInvoice();
      setIsSaving(false);

      // Only show toast on error, success is shown via SaveIndicator
      if (!success) {
        add({
          title: "Failed to save invoice",
          description:
            "The browser refused the write. Its storage may be full.",
          type: "error",
        });
      }
    }, 1000); // Debounce save by 1 second

    return () => clearTimeout(timeoutId);
  }, [formData, saveInvoice, add]);

  // Leaving within the debounce window would otherwise drop the last edits
  useEffect(
    () => () => {
      if (hasPendingSave.current) {
        hasPendingSave.current = false;
        saveInvoice();
      }
    },
    [saveInvoice]
  );

  const handleExportJSON = () => {
    const exportData = {
      ...formData,
      items: formData.items.map((item) => ({
        ...item,
        amount: item.quantity * item.rate,
      })),
    };
    exportJSON(exportData, `invoice-${formData.invoiceId}.json`);
  };

  const handleImportJSON = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const jsonData = await readJsonFile(file);
      importJSON(jsonData as Parameters<typeof importJSON>[0]);

      event.target.value = "";
    } catch (error) {
      console.error(
        "Failed to import JSON file. Please check the file format.",
        error
      );
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        actions={
          <>
            <Button
              aria-label="Import JSON"
              iconOnly
              onClick={() => fileInputRef.current?.click()}
              title="Import JSON"
            >
              <UploadIcon size={16} weight="bold" />
            </Button>
            <input
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => handleImportJSON(event)}
              ref={fileInputRef}
              tabIndex={-1}
              type="file"
            />
            <Button
              aria-label="Export JSON"
              iconOnly
              onClick={handleExportJSON}
              title="Export JSON"
            >
              <DownloadIcon size={16} weight="bold" />
            </Button>
            {formData.id && formData.id !== "" && (
              <Button
                onClick={() => router.navigate({ to: "/invoice/preview" })}
                variant="primary"
              >
                <EyeIcon size={16} weight="bold" />
                Preview
              </Button>
            )}
          </>
        }
        leading={
          <Button
            aria-label="Back to invoices"
            iconOnly
            onClick={() => router.navigate({ to: "/invoice" })}
            variant="ghost"
          >
            <ArrowUUpLeftIcon size={16} weight="bold" />
          </Button>
        }
        status={<SaveStatus saving={isSaving} />}
        title={invoiceId === "new" ? "Create invoice" : "Edit invoice"}
      />
      <FormWrapper />

      <ConfirmDialog
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        description={description}
        onConfirm={confirmNavigation}
        onOpenChange={(open) => {
          if (!open) {
            cancelNavigation();
          }
        }}
        open={isDialogOpen}
        title={title}
        tone="danger"
      />
    </section>
  );
}
