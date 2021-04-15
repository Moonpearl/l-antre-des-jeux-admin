export default interface SnipcartCollection<T> {
  archived: boolean;
  excludeZeroSales: boolean;
  from?: unknown;
  to?: unknown;
  hasMoreResults: boolean;
  items: T[];
  keywords?: unknown;
  limit: number;
  offset: number;
  orderBy: string;
  totalItems: number;
  offest: number;
  limit: number;
  userDefinedId?: string;
}
