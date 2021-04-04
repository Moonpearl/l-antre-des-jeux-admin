import axios from "axios";
import React, { FC, useContext, useState } from "react";
import { ListGroupItem, Button, Spinner, Form, Col } from "react-bootstrap";
import { SearchContext } from "../contexts";
import { RequestState } from "../enums";
import { BoardGame } from "../interfaces/boardgameatlas";

interface BoardGameItemProps {
  boardGame: BoardGame;
}

const BoardGameItem: FC<BoardGameItemProps> = ({ boardGame }) => {
  const { actions } = useContext(SearchContext);
  const [requestState, setRequestState] = useState(RequestState.Idle);
  const [ebpId, setEbpId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const sendGame = async () => {
    setSubmitted(true);
    if (ebpId === '') {
      return;
    }

    setRequestState(RequestState.Pending);
    await axios.post(`/.netlify/functions/create-game`,
      { ...boardGame, ebpId }
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
      <Form.Group className="d-flex flex-wrap mb-0">
        <Col sm="3">
          <Form.Control 
            type="text" 
            placeholder="Identifiant EBP" 
            size="sm"
            readOnly={requestState !== RequestState.Idle || alreadyAdded}
            value={ebpId}
            onChange={(event) => setEbpId(event.target.value)}
            isValid={submitted && ebpId !== ''}
            isInvalid={submitted && ebpId === ''}
          />
        </Col>
        <Button
          className="mr-2"
          variant={alreadyAdded ? 'secondary' : requestState === RequestState.Success ? 'success' : 'primary'}
          disabled={requestState !== RequestState.Idle || alreadyAdded}
          size="sm"
          onClick={requestState === RequestState.Idle && !alreadyAdded ? sendGame : undefined}
        >
          {makeButtonContent()}
        </Button>
        <span>
          {boardGame.name}
        </span>
      </Form.Group>
    </ListGroupItem>
  );
}

export default BoardGameItem;
