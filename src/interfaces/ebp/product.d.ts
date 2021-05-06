export default interface Product {
  ebpId: string;
  name: string;
  family: string;
  provider: string;
  barCode: string;
  stock: number;
  buyingPrice: number;
  price: number;
  taxRate: number;
  type: string;
}
