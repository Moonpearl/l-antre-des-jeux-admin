import Asset from "./asset";

export default interface Variant extends Asset {
  name: string;
  priceModifier: number;
}
