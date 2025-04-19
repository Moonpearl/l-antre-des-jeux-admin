import React from 'react';
import { EbpImport, GameAdd } from './pages';

import 'bootstrap/dist/css/bootstrap.min.css';
import { EbpContextProvider } from './contexts/ebp-context';
import { GraphcmsContextProvider } from './contexts/graphcms-context';

const App = () => (
  <GraphcmsContextProvider>
    <EbpContextProvider>
      <EbpImport />
      <GameAdd />
    </EbpContextProvider>
  </GraphcmsContextProvider>
);

export default App;
