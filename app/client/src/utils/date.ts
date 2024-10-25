const formattingConfigs: Readonly<
  Record<
    | 'date'
    | 'datetime',
    Intl.DateTimeFormatOptions
  >
> = {
  date: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  datetime: {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  },
} as const;

export function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

export function formatDateCallback(dateString: string, callback: (date: Date) => string): string | null {
  const date = new Date(dateString);

  return isValidDate(date) ? callback(date) : null;
}

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string | null {
  return formatDateCallback(dateString, (date) => date.toLocaleDateString(
    navigator.language || 'en-US',
    {
      ...formattingConfigs.date,
      ...(options || {}),
    },
  ));
}

export function formatDatetime(dateString: string, options?: Intl.DateTimeFormatOptions): string | null {
  return formatDate(dateString, {
    ...formattingConfigs.datetime,
    ...(options || {}),
  });
}
