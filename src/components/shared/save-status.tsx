import { Spinner } from "@irshadnazree/just-things-ui";

/** Autosave state, shown next to the page title while a save is pending. */
export function SaveStatus({ saving }: { saving: boolean }) {
  return (
    <span
      aria-live="polite"
      className="jt-muted flex items-center gap-2 text-sm"
    >
      {saving && (
        <>
          <Spinner />
          Saving…
        </>
      )}
    </span>
  );
}
