import axios from "axios";
import React, { FC, useContext, useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { SearchContext } from "../contexts";
import { RequestState } from "../enums";
import { SearchParams, SearchResults } from "../interfaces";
import { GraphcmsAllAssets } from "../interfaces/graphcms";

const SearchForm: FC = () => {
  const { params, actions } = useContext(SearchContext);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(
    () => {
      setIsEmpty(
        Object.values(params).every( item => item.length === 0 )
      );
    },
    [params]
  );

  const setParamGenerator = (paramName: keyof SearchParams) =>
    (event: React.ChangeEvent<HTMLInputElement>) => actions.setParam(paramName, event.target.value);
  ;

  const sendSearch = async () => {
    if (isEmpty) {
      throw new Error('Cannot send search with empty parameters.');
    }

    actions.setRequestState(RequestState.Pending);
    let response;
    response = await axios.get<SearchResults>(`/.netlify/functions/game-search?name=${params.name}`);
    actions.setResults(response.data);

    response = await axios.get<GraphcmsAllAssets>(`/.netlify/functions/get-graphcms-assets`);
    actions.setAssets(response.data);
    actions.setRequestState(RequestState.Success);
    actions.resetParams();
  };

  return (
    <Card>
      <Card.Body>
      <Form onSubmit={(event) => { event.preventDefault(); sendSearch(); }}>
        <Form.Group controlId="searchName">
          <Form.Label>Nom</Form.Label>
          <Form.Control
            type="text"
            placeholder="Entrez un nom de jeu de société"
            value={params.name}
            onChange={setParamGenerator('name')}
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={isEmpty}>
          Rechercher
        </Button>
      </Form>
      </Card.Body>
    </Card>
  );
};

export default SearchForm;
