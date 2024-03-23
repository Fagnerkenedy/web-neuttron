import React, { useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Cadastro from '../components/users/Cadastro'
import Login from "../components/users/Login"
import PageNotFound from "../components/PageNotFound"
import AuthContext, { AuthProvider } from '../contexts/auth'
import Loading from '../components/utils/Loading';
import AppContent from '../components/content/AppContent';
import DetailView from '../components/content/detailView/DetailView';
import CreateView from '../components/content/createView/CreateViewDef';
import EditView from '../components/content/editView/EditViewDef';
import PageBase from '../components/pageBase/PageBase';
import Settings from '../components/content/settings/Settings';
import Modules from '../components/content/settings/modules/Modules';
import Layout from '../components/content/settings/modules/layout/Layout';

function RoutesPage() {

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

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/:org" element={<Private><PageBase /></Private>}>
            <Route path="/:org/:module" element={<AppContent />} />
            <Route path="/:org/:module/:recordId" element={<DetailView />} />
            <Route path="/:org/:module/create" element={<CreateView />} />
            <Route path="/:org/:module/:recordId/edit" element={<EditView />} />
            <Route path="/:org/settings" element={<Settings />} />
            <Route path="/:org/settings/modules" element={<Modules />} />
            <Route path="/:org/settings/modules/:module" element={<Layout />} />
          </Route>
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default RoutesPage;