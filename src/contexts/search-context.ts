import { createContext } from "react";
import { RequestState } from "../enums";
import { SearchParams, SearchResults } from "../interfaces";

interface SearchContextValue {
  requestState: RequestState;
  params: SearchParams;
  results: SearchResults;
  actions: {
    resetParams: () => void;
    setParam: (name: keyof SearchParams, value: string) => void;
    setResults: (results: SearchResults) => void;
    setRequestState: (requestState: RequestState) => void;
  };
}

const SearchContext = createContext<SearchContextValue>({
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
  },
});

export default SearchContext;
