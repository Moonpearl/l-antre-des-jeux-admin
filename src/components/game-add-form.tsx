import React, { FC, FormEvent, useContext, useState } from "react";
import { Button, Card, Form, Spinner, Table } from "react-bootstrap";
import { EbpContext, GraphcmsContext } from "../contexts";
import ProductContext, { ProductReducerType } from "../contexts/product-context";
import { RequestState } from "../enums";
import { GraphcmsVariant } from "../interfaces/graphcms";
import { UseCollectionType } from "../reducers/create-collection-reducer";

interface VariantItemProps {
  variant: GraphcmsVariant;
}

const VariantItem: FC<VariantItemProps> = ({ variant }) => {
  const { actions } = useContext(ProductContext);

  return (
    <tr>
      <td>
        <Form.Control
          type="text"
          placeholder="Nom de la variante"
          size="sm"
          value={variant.name}
          onChange={event => actions.mutateVariants({
            type: UseCollectionType.Modify,
            payload: { ...variant, name: event.target.value }
          })}
        />
      </td>
      <td>
        <Form.Control
          type="number"
          size="sm"
          step={0.01}
          value={variant.priceModifier}
          onChange={event => actions.mutateVariants({
            type: UseCollectionType.Modify,
            payload: { ...variant, priceModifier: Number(event.target.value) }
          })}
        />
      </td>
      <td>
        <Button
          variant="danger"
          size="sm"
          onClick={() => actions.mutateVariants({
            type: UseCollectionType.Remove,
            payload: variant
          })}
        >
          Supprimer
        </Button>
      </td>
    </tr>
  );
}

const GameAddForm: FC = () => {
  const { findById } = useContext(EbpContext);
  const { shelves } = useContext(GraphcmsContext);
  const { states, actions, assertors } = useContext(ProductContext);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitted(true);

    try {
      const ebpProduct = findById(states.product.ebpId);

      await actions.createProduct({
        ...states.product,
        ebpId: ebpProduct?.ebpId || '',
        ebpName: ebpProduct?.name || '',
        price: ebpProduct?.price || 0,
        lastReportedStock: ebpProduct?.stock || 0,
        slug: states.product.name.toLowerCase().split(/\W/).filter(item => item !== '').join('-'),
        variants: states.variants,
        mechanics: [],
        categories: [],
      });

      actions.mutateProduct({ type: ProductReducerType.Reset, payload: undefined });
      actions.setRequestState(RequestState.Idle);
      setIsSubmitted(false);
    }
    catch (error) {
      actions.setRequestState(RequestState.Failed);
      console.error(error);
    }
  }

  const makeButtonContent = () => {
    switch (states.requestState) {

      case RequestState.Pending:
        return <><Spinner animation="grow" variant="light" size="sm" /> Ajout en cours…</>;
        
      case RequestState.Success:
        return 'Ajouté!';
    
      case RequestState.Failed:
        return 'Erreur lors de l\'ajout';
    
      default:
        return 'Ajouter';
  
    }  
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Nouveau produit</h2>

      {/* EBP id input */}
      <Form.Group controlId="ebpId">
        <Form.Control
          type="text"
          placeholder="Identifiant EBP"
          isValid={(isSubmitted || states.product.ebpId !== '') && assertors.isPropertyValid('ebpId')}
          isInvalid={(isSubmitted || states.product.ebpId !== '') && !assertors.isPropertyValid('ebpId')}
          value={states.product.ebpId}
          onChange={(event) => actions.mutateProduct({ type: ProductReducerType.SetProperties, payload: { ebpId: event.target.value.toUpperCase() } })}
        />
        <Form.Text className="text-muted">
          Identifiant du nouveau produit dans le logiciel EBP (obligatoire).
        </Form.Text>
      </Form.Group>

      {/* Product name input */}
      <Form.Group controlId="productName">
        <Form.Control
          type="text"
          placeholder="Nom du produit"
          isInvalid={isSubmitted && !assertors.isPropertyValid('name')}
          value={states.product.name}
          onChange={(event) => actions.mutateProduct({ type: ProductReducerType.SetProperties, payload: { name: event.target.value } })}
        />
        <Form.Text className="text-muted">
          Nom du nouveau produit à afficher sur le site (obligatoire).
        </Form.Text>
      </Form.Group>

      {/* Product description input */}
      <Form.Group controlId="productDescription">
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Description du produit"
          value={states.product.description}
          onChange={(event) => actions.mutateProduct({ type: ProductReducerType.SetProperties, payload: { description: event.target.value } })}
        />
        <Form.Text className="text-muted">
          Description du nouveau produit à afficher sur le site.
        </Form.Text>
      </Form.Group>

      {/* Product shelf selector */}
      <Form.Group controlId="productShelf">
        <Form.Control
          as="select"
          custom
          isInvalid={isSubmitted && !assertors.isPropertyValid('shelf')}
          value={states.product.shelf?.id || ''}
          onChange={(event) => actions.mutateProduct({ type: ProductReducerType.SetProperties, payload: { shelf: shelves.find(shelf => shelf.id === event.target.value) } })}
        >
          <option value="">Choisissez un rayon…</option>
          {shelves.map( ({ id, name }) =>
            <option key={id} value={id}>{name}</option>
          )}
        </Form.Control>
        <Form.Text className="text-muted">
          Rayon dans lequel on trouvera le nouveau produit (obligatoire).
        </Form.Text>
      </Form.Group>

      {/* Variants form */}
      <Form.Group>
        <Card>
          <Card.Body>
            <h2>Variantes</h2>
            {states.variants.length === 0 ?
              <Form.Text className="text-muted mb-2">
                Aucune variante pour ce produit.
              </Form.Text>
              :
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Modificateur de prix</th>
                    <th>Supprimer</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    states.variants.sort( (v1, v2) => Number(v1.id) - Number(v2.id)).map(
                      variant =>
                        <VariantItem key={variant.id} variant={variant} />
                    )                
                  }
                </tbody>
              </Table>
            }
            <Button
              variant="success"
              size="sm"
              onClick={() => actions.mutateVariants({
                type: UseCollectionType.Add,
                payload: { id: String(new Date().getTime()), slug: '', name: '', priceModifier: 0 }
              })}
            >
              Ajouter une variante
            </Button>
          </Card.Body>
        </Card>
      </Form.Group>

      {/* Submit button */}
      <Button
        variant={states.requestState === RequestState.Failed ? 'danger' : 'primary'}
        type="submit"
        disabled={states.requestState === RequestState.Pending}
      >
        {makeButtonContent()}
      </Button>
    </Form>
  );
}

export default GameAddForm;
