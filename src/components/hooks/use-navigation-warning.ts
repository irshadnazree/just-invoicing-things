import { useBlocker } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

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
  title = "Unsaved changes",
  description = "You have unsaved changes. Are you sure you want to leave?",
  confirmLabel = "Leave",
  cancelLabel = "Stay",
}: UseNavigationWarningProps): NavigationWarningState {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // A ref, so the dialog closing right after Leave can't also reset the navigation it just let through
  const pendingNavigation = useRef<{
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
      pendingNavigation.current = {
        proceed: blocker.proceed,
        reset: blocker.reset,
      };
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
    const pending = pendingNavigation.current;
    pendingNavigation.current = null;
    pending?.proceed();
    setIsDialogOpen(false);
  }, []);

  const cancelNavigation = useCallback(() => {
    const pending = pendingNavigation.current;
    pendingNavigation.current = null;
    pending?.reset();
    setIsDialogOpen(false);
  }, []);

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
