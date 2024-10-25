// eslint-disable-next-line max-classes-per-file
export class TimeoutError extends Error {
  public constructor(public readonly ms: number, message?: string) {
    super(message);
  }
}

export class Schedule {
  #timer: number | undefined;

  public setOperation(operation: VoidFunction, timeout: number, ...args: readonly unknown[]): void {
    this.clear();
    this.#timer = setTimeout(operation, timeout, ...args);
  }

  public clear(): void {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = undefined;
    }
  }
}

export async function sleep(ms: number): Promise<void> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @throws TimeoutError
 */
export async function timedPromise<T>(ms: number, promise: Promise<T>): typeof promise {
  if (ms <= 0) {
    return promise;
  }

  const schedule = new Schedule();

  return Promise.race<T>([
    // eslint-disable-next-line promise/param-names
    new Promise((_, reject) => {
      schedule.setOperation(reject, ms, new TimeoutError(ms));
    }),
    promise.then((value) => {
      schedule.clear();
      return value;
    }),
  ]);
}
