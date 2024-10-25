import { runTest } from '@/utils/test-runner';

import { number } from './number';

describe('@/utils/number', () => {
  describe('format', () => {
    for (const [args, expected] of [
      [[-1], 'N/A'],
      [[NaN], 'N/A'],
      [[Number.MIN_SAFE_INTEGER], 'N/A'],
      [[0], '0 Bytes'],
      [[1024], '1 KB'],
      [[1048576], '1 MB'],
      [[1073741824], '1 GB'],
      [[123], '123 B'],
      [[1500], '1.46 KB'],
      [[1563000], '1.49 MB'],
      [[1638400000], '1.53 GB'],
      [[16384000000000], '14.9 TB'],
      [[1638400000000000], '1.46 PB'],
    ] as const) {
      runTest(number.format, 'fileSize', args, expected);
    }

    for (const [args, expected] of [
      [[0], 0],
      [[NaN], NaN],
      [['d'], NaN],
      [[0.100], 0.1],
      [[20.3], 20.3],
      [[55.00], 55],
    ] as const) {
      runTest(number.format, 'toFixed', args, expected);
    }
  });
});
