import Asset from "./asset";

export default interface Shelf extends Asset {
  name: string;
  description: string;
}
