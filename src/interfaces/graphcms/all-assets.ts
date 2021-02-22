import Asset from "./asset";

type AssetType = 'products';

type AllAssets = Record<AssetType, Asset[]>;

export default AllAssets;
