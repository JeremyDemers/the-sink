import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { routes } from '@routes';

import ProjectModel from '@models/Project';

import Layout from '@components/Layout';
import { RequireAccess } from '@components/RequireAccess';

import './App.scss';

const homepage = ProjectModel.routes.list.path;

function App() {
  return (
    <Layout>
      <Routes>
        <Route index element={<Navigate to={homepage} replace />} />
        {routes.map((route) => (
          <Route key={route.path} element={<RequireAccess thing={route} />}>
            <Route path={route.path} element={<route.component />} />
          </Route>
        ))}
      </Routes>
    </Layout>
  );
}

export default App;
