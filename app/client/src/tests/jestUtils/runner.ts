export function formatArgs(args: readonly unknown[]): string {
  const argsString = JSON
    .stringify(args)
    .substring(1);

  return argsString.substring(0, argsString.length - 1);
}
