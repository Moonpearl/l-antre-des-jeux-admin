import axios from "axios";
import React, { ChangeEventHandler, FC, useContext, useEffect, useState } from "react";
import { ListGroupItem, Button, Spinner, Form, Col } from "react-bootstrap";
import { EbpContext, SearchContext } from "../contexts";
import { RequestState } from "../enums";
import { BoardGame } from "../interfaces/boardgameatlas";
import { EbpProduct } from "../interfaces/ebp";

interface BoardGameItemProps {
  boardGame: BoardGame;
}

const BoardGameItem: FC<BoardGameItemProps> = ({ boardGame }) => {
  const { findById } = useContext(EbpContext);
  const { actions } = useContext(SearchContext);
  const [requestState, setRequestState] = useState(RequestState.Idle);
  const [ebpId, setEbpId] = useState('');
  const [ebpProduct, setEbpProduct] = useState<EbpProduct | undefined>();
  const [isValid, setIsValid] = useState<boolean | undefined>();
  const [submitted, setSubmitted] = useState(false);

  useEffect(
    () => {
      if (ebpId === '') {
        if (submitted) {
          setIsValid(false);
        } else {
          setIsValid(undefined);
        }
        setEbpProduct(undefined);
      } else {
        const product = findById(ebpId);
    
        if (typeof product === 'undefined') {
          setIsValid(false);
        } else {
          setIsValid(true);
        }
  
        setEbpProduct(product);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ebpId, submitted]
  );

  const handleEbpIdChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value.toUpperCase();
    setEbpId(newValue);
    setSubmitted(false);
  };

  const sendGame = async () => {
    setSubmitted(true);
    if (!isValid) {
      return;
    }

    setRequestState(RequestState.Pending);
    const payload = {
      ...boardGame,
      ebpId: ebpProduct?.ebpId,
      ebpName: ebpProduct?.name,
      price: ebpProduct?.price,
      stock: ebpProduct?.stock,
    };
    await axios.post(`/.netlify/functions/create-game`,
      payload
    );
    await axios.post(`/.netlify/functions/create-snipcart-product`,
      { slug: boardGame.handle.split('-').filter(item => item !== '').join('-') }
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
            onChange={handleEbpIdChange}
            isValid={isValid}
            isInvalid={isValid === false}
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
