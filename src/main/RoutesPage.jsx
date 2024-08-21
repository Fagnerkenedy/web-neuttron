import React, { useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Cadastro from '../components/users/Cadastro'
import Login from "../components/users/Login"
import ConfirmedEmail from '../components/users/ConfirmEmail.jsx';
import PageNotFound from "../components/PageNotFound"
import AuthContext, { AuthProvider } from '../contexts/auth'
import Loading from '../components/utils/Loading';
import Home from '../components/content/home/Home';
import AppContent from '../components/content/AppContent';
import DetailView from '../components/content/detailView/DetailView';
import CreateView from '../components/content/createView/CreateViewDef';
import EditView from '../components/content/editView/EditViewDef';
import PageBase from '../components/pageBase/PageBase';
import Settings from '../components/content/settings/Settings';
import Modules from '../components/content/settings/modules/Modules';
import Layout from '../components/content/settings/modules/layout/Layout';
import Payment from '../components/checkout/Payment';
import { useAbility } from '../contexts/AbilityContext.js'
import { ConfigProvider } from 'antd';
// import PermissionsPage from '../components/content/detailView/PermissionsPage.js';

function RoutesPage() {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/')
  const org = pathParts[1]
  const moduleName = pathParts[2]

  const Private = ({ children }) => {
    const { authenticated, loading } = useContext(AuthContext);

    if (loading) {
      return <Loading />
    }

    if (!authenticated) {
      return <Navigate to="/login" />
    }

    return children;
  }

  const AuthorizedRoute = ({ action, subject, children }) => {
    const { ability, loading } = useAbility();
    if (loading) {
      return;
    }
    // console.log(`ability.can(${action}, ${subject})`, ability.can(action, subject))
    ability.can(action, subject)

    if (!ability.can(action, subject)) {
      return <Navigate to={`/${org}/not-authorized`} />;
    }

    return children;
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        {/* <AbilityProvider> */}
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1a73e8', // #1a73e8 #004E99
              // colorLinkHover: '#004E99', // Cor legal: 277AF7
              colorSuccess: '#6aaf35'
            },
          }}
        >
          <Routes>
            {/* <Route path="/" element={<Navigate to="/login" />} /> */}
            <Route path="/:org" element={<Private><PageBase /></Private>}>
              <Route path="/:org/home" element={<Home />} />
              <Route path="/:org/:module" element={<AuthorizedRoute action="read" subject={moduleName}><AppContent /></AuthorizedRoute>} />
              <Route path="/:org/:module/:recordId" element={<AuthorizedRoute action="read" subject={moduleName}><DetailView /></AuthorizedRoute>} />
              <Route path="/:org/:module/create" element={<AuthorizedRoute action="create" subject={moduleName}><CreateView /></AuthorizedRoute>} />
              <Route path="/:org/:module/:recordId/edit" element={<AuthorizedRoute action="update" subject={moduleName}><EditView /></AuthorizedRoute>} />
              <Route path="/:org/settings" element={<Settings />} />
              <Route path="/:org/settings/modules" element={<Modules />} />
              {/* <Route path="/:org/settings/roles" element={<PermissionsPage />} /> */}
              <Route path="/:org/settings/modules/:module" element={<Layout />} />
              <Route path="/:org/checkout" element={<Payment />} />
            </Route>
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro/confirmacao/:uuid" element={<ConfirmedEmail />}  />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </ConfigProvider>
        {/* </AbilityProvider> */}
      </AuthProvider>
    </BrowserRouter>
  )
}

export default RoutesPage;