import React from 'react';
import { Link } from 'react-router-dom';

import { AppMetadata } from '@constants';

import { t } from '@plugins/i18n';

import { LanguageSwitcher } from '@components/LanguageSwitcher';

import sinkLogo from '../images/the-sink-logo.svg';

const Footer: React.FC = () => {
  return (
    <footer className="position-relative container d-flex align-items-center justify-content-between py-4">
      <div className="d-flex align-items-center justify-content-end gap-3">
        <small>
          {t('© {{ year }} TheSink Inc. All rights reserved.', { year: new Date().getFullYear() })}
        </small>

        <LanguageSwitcher />
      </div>

      <div className="d-flex align-items-center justify-content-end gap-3">
        <Link rel="home" to="/">
          <img src={sinkLogo} alt={AppMetadata.title} height="33" />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
