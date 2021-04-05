import React from 'react';
import { EbpImport, GameSearch } from './pages';

import 'bootstrap/dist/css/bootstrap.min.css';
import { InitialLoader } from './components';
import { EbpContextProvider } from './contexts/ebp-context';

const App = () => (
  <InitialLoader>
    <EbpContextProvider>
      <EbpImport />
      <GameSearch />
    </EbpContextProvider>
  </InitialLoader>
);

export default App;
