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
import { Button } from "@/components/ui/Button";
import { ConfirmationDialog } from "@/components/ui/Dialog";
import { SaveIndicator } from "@/components/ui/SaveIndicator";
import { useToastManager } from "@/lib/provider/toast-provider";
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
  const { add } = useToastManager();
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
    title: "Unsaved Changes",
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
    <section className="flex flex-col gap-5">
      <div className="flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-center xl:gap-0">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">
            {invoiceId === "new" ? "Create Invoice" : "Edit Invoice"}
          </h1>

          <Button
            aria-label="Go back"
            icon={
              <ArrowUUpLeftIcon
                className="size-4 xl:size-5"
                size={20}
                weight="bold"
              />
            }
            onClick={() => router.navigate({ to: "/invoice" })}
            size="sm"
          />
          <SaveIndicator show={isSaving} />
        </div>
        <div className="flex items-center gap-1 xl:gap-2">
          {formData.id && formData.id !== "" && (
            <Button
              icon={
                <EyeIcon className="size-4 xl:size-5" size={20} weight="bold" />
              }
              onClick={() => router.navigate({ to: "/invoice/preview" })}
              size="sm"
            >
              Preview
            </Button>
          )}

          <Button
            aria-label="Import JSON"
            icon={
              <UploadIcon
                className="size-4 xl:size-5"
                size={20}
                weight="bold"
              />
            }
            onClick={() => fileInputRef.current?.click()}
            size="sm"
          />
          <input
            onChange={(event) => handleImportJSON(event)}
            ref={fileInputRef}
            style={{ display: "none" }}
            type="file"
          />
          <Button
            aria-label="Export JSON"
            icon={
              <DownloadIcon
                className="size-4 xl:size-5"
                size={20}
                weight="bold"
              />
            }
            onClick={handleExportJSON}
            size="sm"
          />
        </div>
      </div>
      <FormWrapper />

      <ConfirmationDialog
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        description={description}
        onCancel={cancelNavigation}
        onConfirm={confirmNavigation}
        open={isDialogOpen}
        title={title}
        variant="warning"
        onOpenChange={(open) => {
          if (!open) {
            cancelNavigation();
          }
        }}
      />
    </section>
  );
}
