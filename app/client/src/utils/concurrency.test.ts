import { pool } from '@utils/concurrency';
import { sleep } from '@utils/timeout';

describe('@utils/concurrency', () => {
  describe(pool, () => {
    it('should limit running operations based on concurrency', async () => {
      const workersPool = pool<number>(2);
      const results: Array<Promise<number>> = [];
      const run = (result: number, expectedRunning: number): void => {
        results.push(workersPool.run(() => sleep(1).then(() => result)));
        expect(workersPool.running).toBe(expectedRunning);
      };

      run(1, 1);
      run(2, 2);
      run(3, 2);
      run(4, 2);

      expect(await Promise.all(results)).toStrictEqual([1, 2, 3, 4]);
      expect(workersPool.running).toBe(0);
    });
  });
});
