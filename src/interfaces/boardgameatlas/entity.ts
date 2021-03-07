import ResourceType from "./resource-type";

export default interface Entity {
  id: string;
  type?: ResourceType;
  url?: string;
}
