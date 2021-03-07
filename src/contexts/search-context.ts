import { createContext } from "react";
import { RequestState } from "../enums";
import { SearchParams, SearchResults } from "../interfaces";
import { GraphcmsAllAssets } from "../interfaces/graphcms";

interface SearchContextValue {
  requestState: RequestState;
  params: SearchParams;
  results: SearchResults;
  assets?: GraphcmsAllAssets,
  actions: {
    resetParams: () => void;
    setParam: (name: keyof SearchParams, value: string) => void;
    setResults: (results: SearchResults) => void;
    setRequestState: (requestState: RequestState) => void;
    setAssets: (assets: GraphcmsAllAssets) => void;
    assetExists: (type: keyof GraphcmsAllAssets, boardgameatlasId: string) => boolean;
  };
}

const defaultValue: SearchContextValue = {
  requestState: RequestState.Idle,
  params: {
    name: '',
  },
  results: {
    count: 0,
    games: [],
  },
  actions: {
    setParam: () => {},
    setResults: () => {},
    resetParams: () => {},
    setRequestState: () => {},
    setAssets: () => {},
    assetExists: () => false,
  },
};

const SearchContext = createContext<SearchContextValue>(defaultValue);

export default SearchContext;
