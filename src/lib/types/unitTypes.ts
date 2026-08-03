export interface UnitResponse {
  id: string;
  name: string;
  slug: string;
  note: string | null;
}

export interface UnitUpsertRequest {
  name: string;
  note?: string | null;
}