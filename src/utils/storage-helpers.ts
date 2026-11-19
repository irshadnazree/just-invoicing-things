export function loadFromStorage<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** Returns false when the browser refuses the write, such as when storage is full. */
export function saveToStorage<T>(key: string, items: T[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch {
    console.warn(`Failed to save ${key} to localStorage`);
    return false;
  }
}

export function findItemById<T extends { id: string }>(
  key: string,
  id: string
): T | null {
  const items = loadFromStorage<T>(key);
  return items.find((item) => item.id === id) || null;
}

export function saveItemToArray<
  T extends { id: string; createdAt?: string; updatedAt?: string },
>(
  key: string,
  item: T,
  isValid: (itm: T) => boolean = () => true,
  limit = 100
): boolean {
  if (!isValid(item)) {
    return false;
  }

  try {
    const items = loadFromStorage<T>(key);
    const existingIndex = items.findIndex((i) => i.id === item.id);

    const itemWithTimestamps = {
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      items[existingIndex] = itemWithTimestamps;
    } else {
      items.unshift(itemWithTimestamps);
    }

    if (items.length > limit) {
      items.splice(limit);
    }

    return saveToStorage(key, items);
  } catch {
    return false;
  }
}
