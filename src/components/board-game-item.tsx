import React, { FC, useContext } from "react";
import { ListGroupItem, Button, Spinner, Form, Col } from "react-bootstrap";
import { GraphcmsContext, SearchContext } from "../contexts";
import { RequestState } from "../enums";
import { useNewProduct } from "../hooks";
import { BoardGame } from "../interfaces/boardgameatlas";


interface BoardGameItemProps {
  boardGame: BoardGame;
}

const BoardGameItem: FC<BoardGameItemProps> = ({ boardGame }) => {
  const { shelves } = useContext(GraphcmsContext);
  const searchContext = useContext(SearchContext);
  const newProductHook = useNewProduct();

  const alreadyAdded = searchContext.actions.assetExists('products', boardGame.id);

  const handleAddButtonClick = () => {
    const { ebpProduct, shelf } = newProductHook.states;

    if (newProductHook.states.requestState === RequestState.Idle && !alreadyAdded) {
      if (typeof ebpProduct === 'undefined') return;

      const {
        id: boardgameatlasId,
        name,
        description,
        handle,
        image_url: imageUrl,
        min_players: minPlayers,
        max_players: maxPlayers,
        min_playtime: minPlaytime,
        max_playtime: maxPlaytime,
        min_age: minAge,
        mechanics,
        categories,
      } = boardGame;

      const slug = handle.split('-').filter(item => item !== '').join('-');

      newProductHook.eventHandlers.createProduct({
        id: '',
        boardgameatlasId,
        name,
        description,
        imageUrl,
        minPlayers,
        maxPlayers,
        minPlaytime,
        maxPlaytime,
        minAge,
        mechanics,
        categories,
        slug,
        ebpId: ebpProduct.ebpId,
        ebpName: ebpProduct.name,
        price: ebpProduct.price,
        lastReportedStock: ebpProduct.stock,
        shelf,
      });
    }
  }

  const makeButtonContent = () => {
    if (alreadyAdded) {
      return 'Déjà ajouté';
    }

    switch (newProductHook.states.requestState) {

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
            readOnly={newProductHook.states.requestState !== RequestState.Idle || alreadyAdded}
            value={newProductHook.states.ebpId}
            onChange={newProductHook.eventHandlers.handleEbpIdChange}
            isValid={newProductHook.states.isValid}
            isInvalid={newProductHook.states.isValid === false}
          />
        </Col>
        <Col sm="3">
          <Form.Control
            as="select"
            custom
            size="sm"
            disabled={alreadyAdded}
            value={newProductHook.states.shelf?.id || ''}
            onChange={newProductHook.eventHandlers.handleShelfChange}
            isInvalid={newProductHook.states.submitted && typeof newProductHook.states.shelf === 'undefined'}
          >
            <option value="">Choisissez un rayon…</option>
            {shelves.map( ({ id, name }) =>
              <option value={id}>{name}</option>
            )}
          </Form.Control>
        </Col>
        <Button
          className="mr-2"
          variant={alreadyAdded ? 'secondary' : newProductHook.states.requestState === RequestState.Success ? 'success' : 'primary'}
          disabled={newProductHook.states.requestState !== RequestState.Idle || alreadyAdded}
          size="sm"
          onClick={handleAddButtonClick}
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
