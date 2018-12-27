export async function promiseOrCallback<T = void>(action: () => Promise<T>, cb: (err?: Error, result?: T) => void) {
  let caught: Error;
  let res: T;
  try {
    res = await action();
    if (!cb) {
      return res;
    }
  } catch (err) {
    caught = err;
    if (!cb) {
      throw err;
    }
  } finally {
    if (cb) {
      process.nextTick(() => cb(caught, res));
    }
  }
}
