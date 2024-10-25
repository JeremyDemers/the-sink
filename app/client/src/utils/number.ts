import { t } from '@plugins/i18n';

const zeroBytes = t('0 Bytes');
const notAvailable = t('N/A');
const kilobyte = 1024 as const;
const fileSizeUnits = [
  t('B'),
  t('KB'),
  t('MB'),
  t('GB'),
  t('TB'),
  t('PB'),
] as const;

export const number = {
  coerce: {
    fromUnknown(value: unknown, defaultValue = 0): number {
      if (typeof value === 'number') {
        return value;
      }

      const coerced = Number(value);

      return Number.isNaN(coerced) ? defaultValue : coerced;
    },
  },
  format: {
    toFixed(value: number | string, fraction = 2): number {
      const casted = Number(value);

      return Number.isNaN(casted) ? casted : parseFloat(casted.toFixed(fraction));
    },
    fileSize(bytes: number, invalid = notAvailable): string {
      if (Number.isNaN(bytes) || bytes < 0) {
        return invalid;
      }

      if (bytes === 0) {
        return zeroBytes;
      }

      const logBase = Math.floor(Math.log(bytes) / Math.log(kilobyte));

      return `${number.format.toFixed(bytes / (kilobyte ** logBase), 2)} ${fileSizeUnits[logBase] ?? ''}`;
    },
  },
} as const;
