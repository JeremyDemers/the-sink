import React, { useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { AppMetadata } from '@constants';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';

import './login.scss';

const errors: Record<string, string> = {
  'user-blocked': t('Access Denied. The user account has been blocked.'),
  'user-registration-close': t('Access Denied. You must have an account to access this application.'),
};

export const PageLogin: React.FC = () => {
  const [ params ] = useSearchParams();

  useEffect(() => {
    const error = params.get('error');

    if (error !== null && error in errors) {
      toast.error(errors[error]);
    }
  }, [params]);

  const { login } = useContext(AuthContext);
  return (
    <div className="page-login d-flex flex-column align-items-start justify-content-center">
      <div className="container d-flex">
        <div className="page-login__container d-flex flex-column">
          <h1 className="mt-0">
            {t('Welcome')}
            <span>
              {t('to')} <strong>{AppMetadata.title}</strong>
            </span>
          </h1>
          <p className="description mb-4">
            {t('This template provides developers a quick starting point to deploy applications that have configured SSO, CI/CD pipelines to automatically test and deploy to AWS, and is supported by Sink digital.')}
          </p>
          <button className="btn btn--primary ms-auto" onClick={login}>
            {t('Sign in with TheSink credentials')}
            <i className="font-icon-chevron-right icon-s" />
          </button>
        </div>
      </div>
    </div>
  );
};
