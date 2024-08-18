import { QueryConstructor, useRxData as rxdbUseRxData } from "rxdb-hooks";

export function useRxData<T>(name: string, query: QueryConstructor<T>) {
  const { isFetching, result } = rxdbUseRxData<T>(name, query, { json: true });

  return { isFetching, result: result as T[] | [] };
}
