import React from 'react';

import { t } from '@plugins/i18n';

import CollapsibleContent from '@components/CollapsibleContent';
import DataFetchRedux from '@components/Examples/DataFetchRedux';
import DataFetchState from '@components/Examples/DataFetchState';
import FormikForm from '@components/Examples/FormikForm';

import '@components/Examples/examples.scss';

export const PageExamples: React.FC = () => {
  return (
    <div>
      <h2 className="mb-4">{t('Examples')}</h2>
      <section>
        <h3>
          {t('Data fetch')}
        </h3>
        <div className="mt-4">
          <div className="row">
            <div className="col-md-6 mb-4 mb-md-0">
              <DataFetchRedux />
            </div>
            <div className="col-md-6">
              <DataFetchState />
            </div>
          </div>
        </div>
      </section>
      <section className="mt-5">
        <h3>
          {t('Toggle content')}
        </h3>
        <CollapsibleContent
          buttonConfig={{
            className: 'btn btn--primary mb-4',
            buttonLabel: {
              activeName: t('Collapse content'),
              inactiveName: t('Expand content'),
            },
            icon: {
              activeName: 'chevron-up-small',
              inactiveName: 'chevron-down-small',
              size: 'icon-xs',
              position: 'right',
            },
          }}
          contentConfig={{
            contentClassName: 'card',
          }}
        >
          {t('Collapsible content demonstration.')}
        </CollapsibleContent>
      </section>
      <section className="mt-5">
        <h3>
          {t('Form elements')}
        </h3>
        <FormikForm />
      </section>
    </div>
  );
};
