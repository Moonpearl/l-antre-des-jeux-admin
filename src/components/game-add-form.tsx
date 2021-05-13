import React, { FC, useContext, useReducer } from "react";
import { Button, Card, Form, Table } from "react-bootstrap";
import { GraphcmsContext } from "../contexts";
import { GraphcmsVariant } from "../interfaces/graphcms";
import createCollectionReducer, { UseCollectionType, UseCollectionAction } from "../reducers/create-collection-reducer";

interface VariantItemProps {
  variant: GraphcmsVariant;
  mutateVariants: React.Dispatch<UseCollectionAction<GraphcmsVariant>>;
}

const VariantItem: FC<VariantItemProps> = ({ variant, mutateVariants }) => {
  return (
    <tr>
      <td>
        <Form.Control
          type="text"
          placeholder="Nom de la variante"
          size="sm"
          value={variant.name}
          onChange={event => mutateVariants({
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
          onChange={event => mutateVariants({
            type: UseCollectionType.Modify,
            payload: { ...variant, priceModifier: Number(event.target.value) }
          })}
        />
      </td>
      <td>
        <Button
          variant="danger"
          size="sm"
          onClick={() => mutateVariants({
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
  const { shelves } = useContext(GraphcmsContext);
  const [variants, mutateVariants] = useReducer(createCollectionReducer<GraphcmsVariant>(), []);

  return (
    <Form>
      <h2>Nouveau produit</h2>
      <Form.Group controlId="ebpId">
        <Form.Control type="text" placeholder="Identifiant EBP" />
        <Form.Text className="text-muted">
          Identifiant du nouveau produit dans le logiciel EBP (obligatoire).
        </Form.Text>
      </Form.Group>
      <Form.Group controlId="productName">
        <Form.Control type="text" placeholder="Nom du produit" />
        <Form.Text className="text-muted">
          Nom du nouveau produit à afficher sur le site (obligatoire).
        </Form.Text>
      </Form.Group>
      <Form.Group controlId="productShelf">
        <Form.Control
          as="select"
          custom
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
      <Form.Group>
        <Card>
          <Card.Body>
            <h2>Variantes</h2>
            {variants.length === 0 ?
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
                    variants.sort( (v1, v2) => Number(v1.id) - Number(v2.id)).map(
                      variant =>
                        <VariantItem key={variant.id} variant={variant} mutateVariants={mutateVariants} />
                    )                
                  }
                </tbody>
              </Table>
            }
            <Button
              variant="success"
              size="sm"
              onClick={() => mutateVariants({
                type: UseCollectionType.Add,
                payload: { id: String(new Date().getTime()), slug: '', name: '', priceModifier: 0 }
              })}
            >
              Ajouter une variante
            </Button>
          </Card.Body>
        </Card>
      </Form.Group>
      <Button
        variant="primary"
      >
        Ajouter le produit
      </Button>
    </Form>
  );
}

export default GameAddForm;
