import { useBlocker } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

export type UseNavigationWarningProps = {
  enabled: boolean;
  /** Paths that can be visited without a warning, e.g. a preview that keeps the draft */
  allowedPaths?: string[];
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export type NavigationWarningState = {
  isDialogOpen: boolean;
  confirmNavigation: () => void;
  cancelNavigation: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
};

export function useNavigationWarning({
  enabled,
  allowedPaths = [],
  title = "Unsaved Changes",
  description = "You have unsaved changes. Are you sure you want to leave?",
  confirmLabel = "Leave",
  cancelLabel = "Stay",
}: UseNavigationWarningProps): NavigationWarningState {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    proceed: () => void;
    reset: () => void;
  } | null>(null);

  // Block navigation when enabled
  const blocker = useBlocker({
    shouldBlockFn: ({ next }) =>
      enabled && !allowedPaths.includes(next.pathname),
    enableBeforeUnload: false,
    withResolver: true,
  });

  useEffect(() => {
    if (blocker.status === "blocked") {
      setIsDialogOpen(true);
      setPendingNavigation({
        proceed: blocker.proceed,
        reset: blocker.reset,
      });
    }
  }, [blocker]);

  // Handle browser beforeunload event
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Request the browser's generic unload confirmation dialog.
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled]);

  const confirmNavigation = useCallback(() => {
    pendingNavigation?.proceed();
    setIsDialogOpen(false);
    setPendingNavigation(null);
  }, [pendingNavigation]);

  const cancelNavigation = useCallback(() => {
    pendingNavigation?.reset();
    setIsDialogOpen(false);
    setPendingNavigation(null);
  }, [pendingNavigation]);

  return {
    isDialogOpen,
    confirmNavigation,
    cancelNavigation,
    title,
    description,
    confirmLabel,
    cancelLabel,
  };
}
