import React, { FC, useState } from "react";
import { Container } from "react-bootstrap";
import { SearchForm, SearchResultList } from "../components";
import { SearchContext } from "../contexts";
import { RequestState } from "../enums";
import { SearchParams, SearchResults } from "../interfaces";

const defaultSearchParams: SearchParams = {
  name: '',
};

const defaultSearchResults: SearchResults = {
  count: 0,
  games: [],
};

const GameSearch: FC = () => {
  const [requestState, setRequestState] = useState(RequestState.Idle);
  const [searchParams, setSearchParams] = useState<SearchParams>(defaultSearchParams);
  const [searchResults, setSearchResults] = useState<SearchResults>(defaultSearchResults);

  const resetParams = () => {
    setSearchParams(defaultSearchParams);
  }

  const setParam = (name: keyof SearchParams, value: string) => {
    setSearchParams({
      ...searchParams,
      [name]: value,
    });
  };

  const contextValue = {
    requestState,
    params: searchParams,
    results: searchResults,
    actions: {
      resetParams,
      setParam,
      setResults: (results: SearchResults) => setSearchResults(results),
      setRequestState: (requestState: RequestState) => setRequestState(requestState),
    }
  };

  return (
    <Container>
      <h1 className="mt-4 mb-4">Ajouter des jeux</h1>
      <p>
        Cette page vous permet de rechercher des jeux de société listés sur <a target="_blank" rel="noreferrer" href="https://www.boardgameatlas.com/">Board Game Atlas</a>. Lorsque vous avez trouvé le(s) jeu(x) qui vous intéressent, vous pouvez le(s) sélectionner pour l(es) ajouter au gestionnaire de contenus de l'Antre des jeux.
      </p>
      <SearchContext.Provider value={contextValue}>
        <SearchForm />
        <SearchResultList />
      </SearchContext.Provider>
    </Container>
  );
}

export default GameSearch;
