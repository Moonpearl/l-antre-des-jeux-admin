import React from 'react';
import { GameSearch } from './pages';

import 'bootstrap/dist/css/bootstrap.min.css';
import { InitialLoader } from './components';

const App = () => (
  <InitialLoader>
    <GameSearch />
  </InitialLoader>
);

export default App;
