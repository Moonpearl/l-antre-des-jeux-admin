import React, { FC, useContext } from "react";
import { SearchContext } from "../contexts";
import { Alert, ListGroup, ListGroupItem, Spinner } from "react-bootstrap";
import { RequestState } from "../enums";

const SearchResultList: FC = () => {
  const { requestState, results } = useContext(SearchContext);

  switch (requestState) {

    case RequestState.Idle:
      return null;
    
    case RequestState.Pending:
      return (
        <div className="d-flex justify-content-center mt-4">
          <Spinner animation="grow" variant="primary" />
        </div>
      );

    case RequestState.Failed:
      return (
        <Alert variant="danger">
          Une erreur est survenue durant la recherche
        </Alert>
      );

    default:
      return (
        <>
          <h2 className="mt-4">
            {results.count === 0 ? 'Aucun résultat' : `${results.count} résultats`}            
          </h2>
          <ListGroup>
            {
              results.games.map(
                (boardGame, index) =>
                  <ListGroupItem key={index} action>
                    {boardGame.name}
                  </ListGroupItem>
              )
            }
          </ListGroup>
        </>
      );
  }
}

export default SearchResultList;
