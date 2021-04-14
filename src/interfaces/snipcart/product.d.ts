export default interface SnipcartProduct {
  allowOutOfStockPurchases: boolean;
  archived: boolean;
  categories: unknown[];
  creationData: string;
  fileGuid?: string;
  id: string;
  modificationData: string;
  mode: string;
  userDefinedId: string;
  url: string;
  price: number;
  name: string;
  description: string;
  image: string;
  inventoryManagementMethod: string;
  stock: number;
  totalStock: number;
  statistics: {
    numberOfSales: number;
    totalSales: number;
  };
  customFields: unknown[];
  variants: unknown[];
  metadata?: string;
  id: string;
  url: string;
}
