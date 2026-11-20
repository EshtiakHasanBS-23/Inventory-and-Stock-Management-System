import { useState } from "react";

/** Rows shown at first and added by each "Load more" on a loaded list. */
export const LIST_PAGE_SIZE = 50;

/**
 * Shows a long, already loaded list one page at a time. A new `resetKey`
 * (another search or date range) starts again from the first page.
 */
export function useShowMore<T>(
  items: readonly T[],
  resetKey: string,
  pageSize = LIST_PAGE_SIZE,
) {
  const [shown, setShown] = useState({ key: resetKey, count: pageSize });
  const count = shown.key === resetKey ? shown.count : pageSize;
  return {
    visible: items.slice(0, count),
    hasMore: items.length > count,
    showMore: () => setShown({ key: resetKey, count: count + pageSize }),
  };
}
