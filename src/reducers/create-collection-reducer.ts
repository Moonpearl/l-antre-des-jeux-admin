import Asset from "../interfaces/graphcms/asset";

export enum UseCollectionType {
  Add = 'USE_COLLECTION_ADD',
  Modify = 'USE_COLLECTION_MODIFY',
  Remove = 'USE_COLLECTION_REMOVE',
  Reset = 'USE_COLLECTION_RESET',
};

type UseCollectionPayload<T extends Asset> = {
  [UseCollectionType.Add]: T;
  [UseCollectionType.Modify]: T;
  [UseCollectionType.Remove]: T;
  [UseCollectionType.Reset]: undefined;
};

export type UseCollectionAction<T extends Asset> = {
  [K in UseCollectionType]: {
    type: K;
    payload: UseCollectionPayload<T>[K];
  }
}[UseCollectionType];

const createCollectionReducer = <T extends Asset>() =>
  (state: T[], action: UseCollectionAction<T>) => {
    switch (action.type) {
      case UseCollectionType.Add:
        return [...state, action.payload];

      case UseCollectionType.Modify:
        return [...state.filter(item => item.id !== action.payload.id), action.payload];

      case UseCollectionType.Remove:
        return state.filter(item => item.id !== action.payload.id);

      case UseCollectionType.Reset:
        return [];

      default:
        return state;
    }
  };

export default createCollectionReducer;
