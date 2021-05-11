import axios from "axios";
import React, { createContext, FC, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { GraphcmsShelf } from "../interfaces/graphcms";

interface GraphcmsContextValue {
  shelves: GraphcmsShelf[];
}

const defaultValue = {
  shelves: [],
};

const GraphcmsContext = createContext<GraphcmsContextValue>(defaultValue);

export const GraphcmsContextProvider: FC = ({ children }) => {
  const [shelves, setShelves] = useState<GraphcmsShelf[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(
    () => {
      axios.get<GraphcmsShelf[]>('/.netlify/functions/get-graphcms-shelves')
      .then( ({ data }) => setShelves(data) )
      .catch(error => setErrorMessage(error.message));
    }, []
  );

  const value = {
    shelves,
  };

  return (
    <GraphcmsContext.Provider value={value}>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {children}
    </GraphcmsContext.Provider>
  );
}

export default GraphcmsContext;
