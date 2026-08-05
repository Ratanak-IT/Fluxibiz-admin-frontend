import { useCallback, useEffect, useRef } from "react";
import type { InfinitePage } from "@/lib/api/infinitePage";

export function useInfiniteScroll<T>({
  data,
  isFetching,
  page,
  setPage,
  rootMargin = "200px",
}: {
  data: InfinitePage<T> | undefined;
  isFetching: boolean;
  page: number;
  setPage: (updater: (prev: number) => number) => void;
  rootMargin?: string;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadedPage = data?.number ?? -1;
  const hasMore = data?.hasMore ?? false;

  const loadMore = useCallback(() => {
    if (isFetching || !hasMore) return;
   
    setPage((prev) => (prev === loadedPage ? prev + 1 : prev));
  }, [isFetching, hasMore, loadedPage, setPage]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, rootMargin]);

  void page;
  return { sentinelRef, loadMore, hasMore, loadedPage };
}