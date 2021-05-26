import React from 'react';
import { EbpImport, GameAdd, GameSearch } from './pages';

import 'bootstrap/dist/css/bootstrap.min.css';
import { InitialLoader } from './components';
import { EbpContextProvider } from './contexts/ebp-context';
import { GraphcmsContextProvider } from './contexts/graphcms-context';

const App = () => (
  <InitialLoader>
    <GraphcmsContextProvider>
      <EbpContextProvider>
        <EbpImport />
        <GameAdd />
        <GameSearch />
      </EbpContextProvider>
    </GraphcmsContextProvider>
  </InitialLoader>
);

export default App;
