function getEmptyValue(initialValue: unknown): unknown {
  // Covers `null` & `undefined`.
  if (initialValue == null) {
    return initialValue;
  }

  if (typeof initialValue === 'string') {
    return '';
  }

  if (typeof initialValue === 'number' || typeof initialValue === 'boolean') {
    return undefined;
  }

  if (Array.isArray(initialValue)) {
    return [];
  }

  if (typeof initialValue === 'object') {
    return {};
  }

  return undefined;
}

export const field = {
  getEmptyValue,
} as const;
