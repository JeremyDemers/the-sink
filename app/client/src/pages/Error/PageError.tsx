import React from 'react';
import { Link } from 'react-router-dom';

import { t } from '@plugins/i18n';

import './error.scss';

export const PageError: React.FC = () => {
  return (
    <div className="error-page text-center">
      <h1>404</h1>
      <p>
        {t('The page you are looking for is gone.')}
      </p>
      <div className="actions">
        <Link className="btn btn--secondary" to="/">
          {t('Go to the home page')}
        </Link>
      </div>
    </div>
  );
};
