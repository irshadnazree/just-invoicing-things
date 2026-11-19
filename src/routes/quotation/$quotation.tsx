import { Button, ConfirmDialog, useToast } from "@irshadnazree/just-things-ui";
import {
  ArrowUUpLeftIcon,
  DownloadIcon,
  EyeIcon,
  UploadIcon,
} from "@phosphor-icons/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useNavigationWarning } from "@/components/hooks/use-navigation-warning";
import FormWrapper from "@/components/page/quotation/form-wrapper";
import { PageHeader } from "@/components/shared/page-header";
import { SaveStatus } from "@/components/shared/save-status";
import { exportJSON, readJsonFile } from "@/lib/utils";
import { useQuotationStore } from "@/stores/quotation-store";
import { isQuotationValid } from "@/utils/quotation";

export const Route = createFileRoute("/quotation/$quotation")({
  loader: ({ params: { quotation } }) => ({ quotationId: quotation }),
  component: RouteComponent,
});

function RouteComponent() {
  const { quotationId } = Route.useLoaderData();
  const router = useRouter();
  const { add } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasPendingSave = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    formData,
    importJSON,
    loadQuotation,
    initializeQuotation,
    saveQuotation,
  } = useQuotationStore(
    useShallow((state) => ({
      formData: state.formData,
      importJSON: state.importJSON,
      loadQuotation: state.loadQuotation,
      initializeQuotation: state.initializeQuotation,
      saveQuotation: state.saveQuotation,
    }))
  );

  // Check if form has unsaved changes (has some data but not valid/saved)
  const hasUnsavedChanges = Boolean(
    formData.id &&
    formData.id !== "" &&
    !isQuotationValid(formData) &&
    (formData.projectTitle.trim() !== "" ||
      formData.quotationFrom.company.trim() !== "" ||
      formData.quotationFor.company.trim() !== "" ||
      formData.bankAccount.trim() !== "" ||
      formData.items.length > 0 ||
      formData.terms.length > 0)
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
    allowedPaths: ["/quotation/preview"],
    title: "Unsaved changes",
    description:
      "You have started filling out this quotation but haven't saved it yet. If you leave now, your progress will be lost.",
    confirmLabel: "Leave",
    cancelLabel: "Stay",
  });

  // Load quotation on component mount
  useEffect(() => {
    // Persist the previous quotation's last edits before replacing it in the store
    if (hasPendingSave.current) {
      hasPendingSave.current = false;
      saveQuotation();
    }
    if (quotationId === "new") {
      // Create new quotation
      initializeQuotation();
    } else {
      // An unsaved draft is only in memory, so keep it rather than reloading from storage
      if (useQuotationStore.getState().formData.id === quotationId) {
        return;
      }
      // Try to load existing quotation
      const loaded = loadQuotation(quotationId);
      if (!loaded) {
        // Quotation not found, redirect to create new
        initializeQuotation();
        router.navigate({
          to: "/quotation/$quotation",
          params: { quotation: "new" },
        });
      }
    }
  }, [quotationId, loadQuotation, initializeQuotation, router, saveQuotation]);

  // Auto-save when form data changes with debounce
  useEffect(() => {
    if (!formData.id || !isQuotationValid(formData)) {
      setIsSaving(false);
      return;
    }

    setIsSaving(true);
    hasPendingSave.current = true;

    const timeoutId = setTimeout(() => {
      hasPendingSave.current = false;
      const success = saveQuotation();
      setIsSaving(false);

      // Only show toast on error, success is shown via SaveIndicator
      if (!success) {
        add({
          title: "Failed to save quotation",
          description:
            "The browser refused the write. Its storage may be full.",
          type: "error",
        });
      }
    }, 1000); // Debounce save by 1 second

    return () => clearTimeout(timeoutId);
  }, [formData, saveQuotation, add]);

  // Leaving within the debounce window would otherwise drop the last edits
  useEffect(
    () => () => {
      if (hasPendingSave.current) {
        hasPendingSave.current = false;
        saveQuotation();
      }
    },
    [saveQuotation]
  );

  const handleExportJSON = () => {
    const exportData = {
      ...formData,
      items: formData.items.map((item) => ({
        ...item,
        amount: item.quantity * item.rate,
      })),
    };
    exportJSON(exportData, `quotation-${formData.quotationId}.json`);
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
                onClick={() => router.navigate({ to: "/quotation/preview" })}
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
            aria-label="Back to quotations"
            iconOnly
            onClick={() => router.navigate({ to: "/quotation" })}
            variant="ghost"
          >
            <ArrowUUpLeftIcon size={16} weight="bold" />
          </Button>
        }
        status={<SaveStatus saving={isSaving} />}
        title={quotationId === "new" ? "Create quotation" : "Edit quotation"}
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
