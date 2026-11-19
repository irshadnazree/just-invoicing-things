import type { MouseEvent } from "react";

/** Opens the native date picker when a date input is clicked anywhere, not only on its icon. */
export function openDatePicker(event: MouseEvent<HTMLInputElement>) {
  const el = event.currentTarget;
  if (el.disabled || el.readOnly || typeof el.showPicker !== "function") {
    return;
  }
  try {
    el.showPicker();
  } catch {
    /* unsupported, not user-activated, or insecure context */
  }
}
