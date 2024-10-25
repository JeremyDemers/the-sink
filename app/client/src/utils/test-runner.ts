type RandomFunction = (...args: readonly Any[]) => Any;

export function formatArgs(args: readonly unknown[]): string {
  const argsString = JSON
    .stringify(args)
    .substring(1);

  return argsString.substring(0, argsString.length - 1);
}

export function runTest<
  Pool extends object,
  Name extends keyof Pool,
  Callable extends Pool[Name] extends infer R extends RandomFunction ? R : never,
  SetupFunc extends RandomFunction,
>(
  pool: Pool,
  method: Name,
  args: Readonly<Parameters<Callable>>,
  expected: Error | ReturnType<Callable>,
  before?: SetupFunc,
  after?: (data: ReturnType<SetupFunc>) => void,
): void {
  const shouldError = expected instanceof Error;
  const should = shouldError
    ? `throw ${expected.toString()}`
    : `return ${typeof expected === 'number' ? expected : JSON.stringify(expected)}`;

  it(`.${String(method)}(${formatArgs(args)}) should ${should}`, () => {
    const data = before?.();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const test = (): unknown => pool[method](...args);

    if (shouldError) {
      expect(test).toThrow(expected);
    } else {
      expect(test()).toStrictEqual(expected);
    }

    after?.(data);
  });
}
