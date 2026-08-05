import type { Page } from "@/lib/types/adminTypes";

export const DEFAULT_PAGE_SIZE = 20;

export interface InfinitePage<T> extends Page<T> {
  hasMore: boolean;
}

export interface PageableQuery {
  page?: number;
  size?: number;
}

const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const unwrapPage = (raw: unknown): Record<string, unknown> => {
  if (!raw || typeof raw !== "object") return {};
  if (Array.isArray(raw)) return { content: raw };

  const box = raw as Record<string, unknown>;
  if (Array.isArray(box.content)) return box;
  if (Array.isArray(box.items)) return { ...box, content: box.items };
  if (Array.isArray(box.results)) return { ...box, content: box.results };
  if (box.data) return unwrapPage(box.data);
  if (box.payload) return unwrapPage(box.payload);
  return box;
};

export function infiniteEndpoint<T extends { id: string }, Q extends PageableQuery>(
  cacheKeyFields: ReadonlyArray<keyof Q>,
) {
  return {
    transformResponse: (raw: unknown, _meta: unknown, arg: Q | void): InfinitePage<T> => {
      const args = (arg ?? {}) as Q;
      const requestedPage = args.page ?? 0;
      const requestedSize = args.size ?? DEFAULT_PAGE_SIZE;

      const body = unwrapPage(raw);
      const content = (body.content ?? []) as T[];

      const number = asNumber(body.number) ?? asNumber(body.page) ?? requestedPage;
      const size = asNumber(body.size) ?? requestedSize;
      const totalElements = asNumber(body.totalElements) ?? asNumber(body.total);
      const totalPages = asNumber(body.totalPages);

      const hasMore =
        totalPages !== undefined && totalPages > 0
          ? number + 1 < totalPages
          : content.length > 0 && content.length >= requestedSize;

      return {
        content,
        number,
        size,
        totalElements: totalElements ?? -1, // -1 = server did not tell us
        totalPages: totalPages ?? -1,
        hasMore,
      };
    },

    serializeQueryArgs: ({ endpointName, queryArgs }: { endpointName: string; queryArgs: Q | void }) => {
      const q = (queryArgs ?? {}) as Q;
      const key: Record<string, unknown> = {};
      for (const field of cacheKeyFields) key[String(field)] = q[field];
      return `${endpointName}(${JSON.stringify(key)})`;
    },

    merge: (currentCache: InfinitePage<T>, incoming: InfinitePage<T>) => {
      if (incoming.number === 0) {
        currentCache.content = incoming.content;
      } else {
        const seen = new Set(currentCache.content.map((item) => item.id));
        currentCache.content.push(...incoming.content.filter((item) => !seen.has(item.id)));
      }
      currentCache.number = incoming.number;
      currentCache.size = incoming.size;
      currentCache.totalPages = incoming.totalPages;
      currentCache.totalElements = incoming.totalElements;
      currentCache.hasMore = incoming.hasMore;
    },

    forceRefetch: ({ currentArg, previousArg }: { currentArg?: Q | void; previousArg?: Q | void }) =>
      (currentArg as Q | undefined)?.page !== (previousArg as Q | undefined)?.page,
  };
}