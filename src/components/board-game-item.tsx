import axios from "axios";
import React, { FC, useContext, useState } from "react";
import { ListGroupItem, Button, Spinner } from "react-bootstrap";
import { SearchContext } from "../contexts";
import { RequestState } from "../enums";
import { BoardGame } from "../interfaces/boardgameatlas";

interface BoardGameItemProps {
  boardGame: BoardGame;
}

const BoardGameItem: FC<BoardGameItemProps> = ({ boardGame }) => {
  const { actions } = useContext(SearchContext);
  const [requestState, setRequestState] = useState(RequestState.Idle);

  const sendGame = async () => {
    setRequestState(RequestState.Pending);
    await axios.post(`/.netlify/functions/create-game`,
      boardGame
    );
    setRequestState(RequestState.Success);
  };

  const alreadyAdded = actions.assetExists('products', boardGame.id);

  const makeButtonContent = () => {
    if (alreadyAdded) {
      return 'Déjà ajouté';
    }

    switch (requestState) {

      case RequestState.Pending:
        return <Spinner animation="grow" variant="light" size="sm" />;
        
      case RequestState.Success:
        return 'Ajouté!';
    
      default:
        return 'Ajouter';
  
    }  
  };

  return (
    <ListGroupItem action>
      <Button
        className="mr-2"
        variant={alreadyAdded ? 'secondary' : 'primary'}
        disabled={requestState !== RequestState.Idle || alreadyAdded}
        size="sm"
        onClick={requestState === RequestState.Idle && !alreadyAdded ? sendGame : undefined}
      >
        {makeButtonContent()}
      </Button>
      {boardGame.name}
    </ListGroupItem>
  );
}

export default BoardGameItem;
