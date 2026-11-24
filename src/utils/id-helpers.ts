export function generateRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(randomValues, (value) => chars[value % chars.length]).join(
    ""
  );
}

const CODE_REGEX = /^(\D*)(\d+)$/;

export function incrementCodeFlexible(code: string) {
  const match = code.match(CODE_REGEX);
  if (!match) {
    throw new Error("Code must end with digits");
  }
  const [, prefix, digits] = match;
  const next = String(Number.parseInt(digits, 10) + 1).padStart(
    digits.length,
    "0"
  );
  return prefix + next;
}

const DISPLAY_ID_REGEX = /^([A-Z]{3})-(\d{4})-(\d{3})$/;

/**
 * Increment a display ID with format TYPE-YEAR-NUMBER
 * Returns default if the ID doesn't match pattern, year doesn't match, or overflows
 */
export function incrementDisplayId(
  currentId: string,
  defaultId: string
): string {
  const match = currentId.match(DISPLAY_ID_REGEX);
  if (!match) {
    return defaultId;
  }

  const [, prefix, year, digits] = match;
  const currentYear = new Date().getFullYear().toString();

  if (year !== currentYear) {
    return `${prefix}-${currentYear}-001`;
  }

  const num = Number.parseInt(digits, 10);

  if (num >= 999) {
    return defaultId;
  }

  const next = String(num + 1).padStart(3, "0");
  return `${prefix}-${year}-${next}`;
}

/**
 * Get the next display ID based on the most recent item
 * Finds item with latest updatedAt, extracts ID, and increments it
 * Returns defaultId if no items or pattern doesn't match
 */
export function getNextDisplayId<T extends { updatedAt: string }>(
  items: Array<T>,
  getDisplayId: (item: T) => string,
  defaultId: string
): string {
  if (items.length === 0) {
    return defaultId;
  }

  const mostRecent = items.reduce((latest, current) =>
    new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
  );

  const currentId = getDisplayId(mostRecent);

  if (!currentId || currentId.trim() === "") {
    return defaultId;
  }

  return incrementDisplayId(currentId, defaultId);
}
