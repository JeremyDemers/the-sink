import { formatDate, formatDatetime } from '@utils/date';
import { formatArgs } from '@tests/jestUtils/runner';

type TestCase<F extends typeof formatDate | typeof formatDatetime> = [
  args: Parameters<F>,
  expected: ReturnType<F>,
  language?: string,
];

type TestSuite<F extends typeof formatDate | typeof formatDatetime> = [
  func: F,
  testCases: readonly TestCase<F>[],
];

describe('@utils/date', () => {
  const testFormatDate: TestSuite<typeof formatDate> = [
    formatDate,
    [
      [['2023-03-22T01:51:42.000Z'], 'Mar 22, 2023'],
      [['2023-03-22T01:51:42.000Z'], '22 бер. 2023 р.', 'uk-UA'],
      [['invalid-date-string'], null],
    ],
  ];

  const testFormatDatetime: TestSuite<typeof formatDatetime> = [
    formatDatetime,
    [
      [['2023-03-22T04:08:42.000Z'], 'Mar 22, 2023, 04:08:42'],
      [['2023-03-22T04:08:42.000Z', { hour12: true }], 'Mar 22, 2023, 04:08:42 AM'],
      [['2023-03-22T01:51:42.000Z'], '22 бер. 2023 р., 01:51:42', 'uk-UA'],
      [['2023-03-22T14:51:42.000Z', { hour12: true }], '22 бер. 2023 р., 02:51:42 пп', 'uk-UA'],
      [['invalid-date-string'], null],
    ],
  ];

  for (const [func, testCases] of [
    testFormatDate,
    testFormatDatetime,
  ]) {
    describe(func, () => {
      for (const [args, expected, language] of testCases) {
        it(`${func.name}(${formatArgs(args)}) should return ${JSON.stringify(expected)}`, () => {
          Object.defineProperty(global.navigator, 'language', {
            value: language || 'en-US',
            configurable: true,
          });

          expect(func(...args)).toBe(expected);
        });
      }
    });
  }
});
