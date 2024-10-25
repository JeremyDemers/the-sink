type OperationProducer<T> = () => Promise<T>;

export interface Pool<T> {
  readonly running: number;
  run(producer: OperationProducer<T>): Promise<T>;
}

export function pool<T>(concurrency: number): Pool<T> {
  const queue: Array<OperationProducer<void>> = [];
  let inProgress = 0;

  return {
    get running(): number {
      return inProgress;
    },
    run(producer): Promise<T> {
      return new Promise((resolve, reject) => {
        if (inProgress < concurrency) {
          inProgress++;

          producer()
            .then(resolve)
            .catch(reject)
            .finally(() => {
              inProgress--;
              queue.shift()?.();
            });
        } else {
          queue.push(
            () => this
              .run(producer)
              .then(resolve)
              .catch(reject),
          );
        }
      });
    },
  };
}
