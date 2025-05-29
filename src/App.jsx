import React from 'react';
// import './App.less';
import 'antd/dist/reset.css';
import './style.less'
import RoutesPage from './main/RoutesPage.jsx';
import { AbilityProvider, useAbility } from './contexts/AbilityContext.jsx'

const App = () => {
  const ability = useAbility()
  return (
    <AbilityProvider value={ability}>
      <div className="App" style={{ backgroundColor: '#1b1b1b' }}>
        <RoutesPage />
      </div>
    </AbilityProvider>
  );
};

export default App;
