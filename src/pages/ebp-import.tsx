import React, { ChangeEvent, FC, FormEventHandler, useContext, useState } from "react";
import { Alert, Button, Container, Form, Spinner } from "react-bootstrap";
import { EbpContext } from "../contexts";
import { RequestState } from "../enums";

const EbpImport: FC = () => {
  const { uploadEbpExport, requestState, products } = useContext(EbpContext);
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
        Cette page permet d'importer les données exportées du logiciel EBP, afin de mettre à jour les stocks et les prix des produits.
      </p>
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
        <Button type="submit" disabled={currentFile === null}>Envoyer</Button>
      </Form>
      {makeAlert()}
    </Container>
  );
}

export default EbpImport;
