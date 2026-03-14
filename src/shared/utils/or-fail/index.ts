export async function orFail<T>(
  resultPromise: Promise<T | undefined | null>,
  error: Error,
): Promise<T> {
  const result = await resultPromise;

  if (!result) {
    throw error;
  }

  return result;
}
