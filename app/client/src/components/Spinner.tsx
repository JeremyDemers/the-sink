import React from 'react';
import { t } from '@plugins/i18n';

const Spinner: React.FC = () => {
  return (
    <div className="loader--component my-5">
      <div className="loader loader--primary" />
      {t('Loading...')}
    </div>
  );
};

export default Spinner;
