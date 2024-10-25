import { sleep, timedPromise, TimeoutError } from '@utils/timeout';

describe('@utils/timeout', () => {
  describe(timedPromise, () => {
    it('should return the result of a promise', async () => {
      expect(timedPromise(5, sleep(1).then(() => 200))).resolves.toBe(200);
    });

    it('should throw error if a promise takes longer than a timeout', async () => {
      expect(timedPromise(1, sleep(5))).rejects.toStrictEqual(new TimeoutError(1));
    });
  });
});
