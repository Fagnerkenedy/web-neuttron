import React from 'react';
import './App.less';
import './style.less'
import RoutesPage from './main/RoutesPage.jsx';
import { AbilityProvider, useAbility } from './contexts/AbilityContext.js'

const App = () => {
  const ability = useAbility()
  return (
    <AbilityProvider value={ability}>
      <div className="App">
        <RoutesPage />
      </div>
    </AbilityProvider>
  );
};

export default App;
