import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Cadastro from '../components/users/Cadastro'
import Login from "../components/users/Login"
import ConfirmedEmail from '../components/users/ConfirmEmail.jsx';
import PageNotFound from "../components/PageNotFound"
import AuthContext, { AuthProvider } from '../contexts/auth'
import Loading from '../components/utils/Loading';
import Home from '../components/content/home/Home';
import Chats from '../components/content/chats/Chats';
import Conversations from '../components/content/chats/Conversations';
import AppContent from '../components/content/AppContent';
import DetailView from '../components/content/detailView/DetailView';
import CreateView from '../components/content/createView/CreateViewDef';
import EditView from '../components/content/editView/EditViewDef';
import PageBase from '../components/pageBase/PageBase';
import Settings from '../components/content/settings/Settings';
import Modules from '../components/content/settings/modules/Modules';
import Layout from '../components/content/settings/modules/layout/Layout';
import Payment from '../components/checkout/Payment';
import { useAbility } from '../contexts/AbilityContext.jsx'
import { ConfigProvider, theme } from 'antd';
import ptBR from 'antd/lib/locale/pt_BR';
import NewPassword from '../components/users/NewPassword.jsx';
import { io } from 'socket.io-client';
// import PermissionsPage from '../components/content/detailView/PermissionsPage.js';
import { MainProvider } from "../components/upload/providers/MainContext";
import HomeUpload from "../components/upload/pages/Home";
import Fields from "../components/upload/pages/Field/teste";
import Mapping from "../components/upload/pages/Mapping";
import Processing from "../components/upload/pages/Processing";
import NotFound from "../components/upload/pages/NotFound";
import Result from "../components/upload/pages/Result";
import AuthorizedRouteWrapper from './AuthorizedRouteWrapper.jsx';


const socket = io(import.meta.env.VITE_LINK_API);

function RoutesPage() {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/')
  const org = pathParts[1]
  const moduleName = pathParts[2]
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString != null) {
      const user = JSON.parse(userString)
      setDarkMode(user.dark_mode)
    }
  }, [])

  const Private = ({ children }) => {
    const { authenticated, loading } = useContext(AuthContext);

    if (loading) {
      return
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
          locale={ptBR}
          theme={{
            // algorithm: darkMode ? [theme.darkAlgorithm, theme.compactAlgorithm] : [theme.defaultAlgorithm, theme.compactAlgorithm], // compactAlgorithm
            token: {
              colorBgBase: darkMode ? '#1b1b1b' : '#f5f5f5',
              colorPrimary: '#1a73e8', // #1a73e8 #004E99
              // colorLinkHover: '#004E99', // Cor legal: 277AF7
              colorSuccess: '#6aaf35',
              borderRadius: 14,
            },
          }}
        >
          <MainProvider>

            <Routes>
              {/* <Route path="/" element={<Navigate to="/login" />} /> */}
              <Route path="/:org" element={<Private><PageBase /></Private>}>
                <Route path="home" element={<Home />} />
                <Route path="chats" element={<Chats socket={socket} />}>
                  <Route path=":conversationId" element={<Conversations socket={socket} />} />
                </Route>
                <Route path=":module" element={<AuthorizedRouteWrapper action="read"><AppContent /></AuthorizedRouteWrapper>} />
                <Route path=":module/:recordId" element={<AuthorizedRouteWrapper action="read"><DetailView /></AuthorizedRouteWrapper>} />
                <Route path=":module/create" element={<AuthorizedRouteWrapper action="create"><CreateView /></AuthorizedRouteWrapper>} />
                <Route path=":module/:recordId/edit" element={<AuthorizedRouteWrapper action="update"><EditView /></AuthorizedRouteWrapper>} />
                {/* <Route path="upload">
                  <Route path="upload/home" element={<HomeUpload></HomeUpload>}></Route>
                  <Route path="upload/fields" element={<Fields></Fields>}></Route>
                  <Route path="upload/mapping" element={<Mapping></Mapping>}></Route>
                  <Route path="upload/processing/:filename" element={<Processing></Processing>}></Route>
                  <Route path="upload/result" element={<Result></Result>}></Route>
                  <Route path="upload/*" element={<NotFound />}></Route>
                </Route> */}
                <Route path="settings" element={<Settings />} />
                <Route path="settings/modules" element={<Modules />} />
                {/* <Route path="roles" element={<PermissionsPage />} /> */}
                <Route path="settings/modules/:moduleLayout" element={<Layout />} />
              </Route>
              <Route path="/:org/checkout" element={<AuthorizedRouteWrapper action="read"><Payment /></AuthorizedRouteWrapper>} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro/confirmacao/:uuid" element={<ConfirmedEmail />} />
              <Route path="/:orgId/cadastro/nova_senha/:uuid" element={<NewPassword />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </MainProvider>
        </ConfigProvider>
        {/* </AbilityProvider> */}
      </AuthProvider>
    </BrowserRouter>
  )
}

export default RoutesPage;