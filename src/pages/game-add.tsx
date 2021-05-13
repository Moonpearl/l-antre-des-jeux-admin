import React, { FC, useContext } from "react";
import { Card, Container } from "react-bootstrap";
import { GameAddForm } from "../components";
import { EbpContext } from "../contexts";
import { RequestState } from "../enums";

const GameAdd: FC = () => {
  const { requestState: ebpImportRequestState } = useContext(EbpContext);

  if (ebpImportRequestState !== RequestState.Success) {
    return null;
  }

  return (
    <Container>
      <h1 className="mt-4 mb-4">Ajouter des produits</h1>
      <Card>
        <Card.Body>
          <GameAddForm />
        </Card.Body>
      </Card>
    </Container>
  );
}

export default GameAdd;
