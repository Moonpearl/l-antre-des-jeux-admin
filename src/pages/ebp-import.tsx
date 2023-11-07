import React, { ChangeEvent, FC, FormEventHandler, useContext, useState } from "react";
import { Accordion, AccordionCollapse, AccordionToggle, Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { EbpContext } from "../contexts";
import { RequestState } from "../enums";

const CurrentlyUpdatingAlert: FC = () => {
  const { updateStocks, stockUpdateState, findById } = useContext(EbpContext);

  if (!updateStocks || typeof stockUpdateState === 'undefined') {
    return null;
  }

  const currentProduct = findById(stockUpdateState.currentId);

  let message;
  if (typeof currentProduct === 'undefined') {
    message = 'Préparation de la mise à jour des stocks…';
  } else {
    message = `(${stockUpdateState.processedCount + 1}/${stockUpdateState.totalCount}) Mise à jour des stocks pour [${currentProduct.ebpId}] "${currentProduct.name}"`;
  }

  return (
    <Alert variant="info">
      <Spinner size="sm" animation="border" variant="info" />&nbsp;
      {message}
    </Alert>
  );
}

const EbpImport: FC = () => {
  const { uploadEbpExport, requestState, products, updateStocks, setUpdateStocks } = useContext(EbpContext);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    if (currentFile !== null) {
      uploadEbpExport(currentFile);
    }
  }

  const getAlertClass = () => {
    switch (requestState) {
      case RequestState.Pending:
        return 'info';
      case RequestState.Success:
        return 'success';
      case RequestState.Failed:
        return 'danger';
      default:
        return 'info';
    }
  }

  const getAlertContent = () => {
    switch (requestState) {
      case RequestState.Pending:
        return (
          <>
            <Spinner variant="info" animation="border" size="sm" />
            &nbsp;
            Import du fichier en cours...
          </>
        );
      case RequestState.Success:
        return `${products.length} produits importés avec succès!`;
      case RequestState.Failed:
        return `Une erreur est survenue pendant l'import du fichier.`;
      default:
        return null;
    }
  }

  const makeAlert = () => {
    if (requestState === RequestState.Idle) {
      return null;
    }

    return (
      <Alert variant={getAlertClass()}>
        {getAlertContent()}
      </Alert>
    )
  }

  return (
    <Container>
      <h1 className="mt-4 mb-4">Importer les données d'EBP</h1>
      <p>
        Cette page permet d'importer les données exportées du logiciel EBP, afin de mettre à jour les stocks des produits dans GraphCMS.
      </p>

      <Accordion>
        <Card>
          <Card.Header>
            <AccordionToggle as={Button} variant="link" eventKey="0">Structure attendue</AccordionToggle>
            <AccordionCollapse eventKey="0">
              <Card.Body>
                <p>
                  La structure attendue de l'export EBP est la suivante:
                </p>
                <ol>
                  <li>Identifiant EBP</li>
                  <li>Nom du produit</li>
                  <li>Famille du produit</li>
                  <li>Fournisseur</li>
                  <li>Code-barres</li>
                  <li>Stock*</li>
                  <li>Prix d'achat*</li>
                  <li>Prix*</li>
                  <li>Taux de TVA*</li>
                  <li>Type de produit</li>
                </ol>
                <p>
                  Note: les colonnes annotées d'une astérisque (*) doivent être sous forme numérique.
                </p>
              </Card.Body>
            </AccordionCollapse>
          </Card.Header>
        </Card>
      </Accordion>

      <Form className="mb-4" onSubmit={handleSubmit}>
        <Form.Group>
          <Form.File
            accept="text/csv, .csv"
            id="ebpImport-file"
            label="Export du logiciel EBP"
            data-browse="Parcourir"
            onChange={(event: ChangeEvent<HTMLInputElement>) => setCurrentFile(event.target.files && event.target.files[0])}
            custom
          />
        </Form.Group>
        <Form.Group>
          <Form.Check
            custom
            type="checkbox"
            id="update-stocks"
            label="Mettre à jour également les stocks dans Snipcart."
            checked={updateStocks}
            onChange={event => setUpdateStocks(event.target.checked)}
          />
        </Form.Group>
        <Button type="submit" disabled={currentFile === null}>Envoyer</Button>
      </Form>
      {makeAlert()}
      <CurrentlyUpdatingAlert />
    </Container>
  );
}

export default EbpImport;
