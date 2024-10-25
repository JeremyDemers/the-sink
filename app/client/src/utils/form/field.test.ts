import { field } from './field';
import { runTest } from '@utils/test-runner';

describe('@utils/form', () => {
  describe('field', () => {
    for (const [args, expected] of [
      [[null], null],
      [[undefined], undefined],
      [[-1], undefined],
      [[NaN], undefined],
      [[Infinity], undefined],
      [[0], undefined],
      [[4], undefined],
      [[true], undefined],
      [[false], undefined],
      [[new Date()], {}],
      [[{ test: 'test' }], {}],
      [[[1, 2, 3]], []],
      [['Title'], ''],
    ] as const) {
      runTest(field, 'getEmptyValue', args, expected);
    }
  });
});
