import axios from "axios";
import React, { FC, useState } from "react";
import { ListGroupItem, Button, Spinner } from "react-bootstrap";
import { RequestState } from "../enums";
import { BoardGame } from "../interfaces/boardgameatlas";

interface ButtonContentProps {
  requestState: RequestState;
}

const ButtonContent: FC<ButtonContentProps> = ({ requestState }) => {
  switch (requestState) {

    case RequestState.Pending:
      return <Spinner animation="grow" variant="light" size="sm" />;
      
    case RequestState.Success:
      return <>Ajouté!</>;
  
    default:
      return <>Ajouter</>;

  }
}

interface BoardGameItemProps {
  boardGame: BoardGame;
}

const BoardGameItem: FC<BoardGameItemProps> = ({ boardGame }) => {
  const [requestState, setRequestState] = useState(RequestState.Idle);

  const sendGame = async () => {
    setRequestState(RequestState.Pending);
    await axios.post(`/.netlify/functions/create-game`,
      boardGame
    );
    setRequestState(RequestState.Success);
  };

  return (
    <ListGroupItem action>
      <Button
        className="mr-2"
        variant={requestState === RequestState.Success ? 'secondary' : 'primary'}
        disabled={requestState !== RequestState.Idle}
        size="sm"
        onClick={requestState === RequestState.Idle ? sendGame : undefined}
      >
        <ButtonContent requestState={requestState} />
      </Button>
      {boardGame.name}
    </ListGroupItem>
  );
}

export default BoardGameItem;
