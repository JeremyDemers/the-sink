import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';

import Spinner from '@components/Spinner';

import { PageError } from '@pages/Error';

import { Pages } from './pages';

export const PageDocs: React.FC = () => {
  const location = useLocation();
  const Page = Pages[location.pathname];

  if (Page) {
    return (
      <Suspense fallback={<Spinner />}>
        <Page />
      </Suspense>
    );
  }

  return <PageError />;
};
