import { Mechanic, Category } from '../boardgameatlas';
import Asset from './asset';
import Shelf from './shelf';
import Variant from './variant';

export default interface Product extends Asset {
  ebpId: string;
  ebpName?: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  minPlaytime?: number;
  maxPlaytime?: number;
  minPlayers?: number;
  maxPlayers?: number;
  minAge?: number;
  lastReportedStock: number;
  shelf?: Shelf;
  mechanics?: Mechanic[];
  categories?: Category[];
  variants?: Variant[];
}
