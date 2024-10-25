import React from 'react';
import { t } from '@plugins/i18n';

import { RootState , store} from '@state/index';

import { useDispatch, useSelector } from 'react-redux';
import { ExampleState, fetchExampleData } from '@state/exampleSlice';

type AppDispatch = typeof store.dispatch;

const DataFetchRedux: React.FC = () => {
  /**
   * Redux example
   */
  const example = useSelector<RootState>(state => state.example) as ExampleState;
  const dispatch = useDispatch<AppDispatch>();

  const fetchDataWithRedux = () => {
    dispatch(fetchExampleData());
  };

  return (
    <div className="card">
      <h5>{t('Data fetch with Redux')}</h5>

      {/* Render Button until we receive data */}
      {!example.data && (
        <div>
          <button
            className="btn btn-success"
            type="button"
            onClick={fetchDataWithRedux}
            disabled={example.loading}
          >
            {t('Run example')}
          </button>
        </div>
      )}

      {/* Error message */}
      {example.status === 'failed' && <div style={{ marginTop: '1rem', color: 'red' }}>{example.error}</div>}

      {/* Loading message*/}
      {example.loading && <div style={{ marginTop: '1rem'}}>{t('Loading...')}</div>}

      {/* Results */}
      <ul className="example-list" data-testid="example-list">
        {!example.loading && !example.error && example.data && Object.entries(example.data).map(([key, value]) => (
          <li key={key} data-testid="example-item">
            <span>{key}: </span>
            <span style={{marginLeft: '0.25rem'}}>{value as string}</span>
          </li>
        ))}
      </ul>

      {/* Results in JSON format */}
      {example.data && <pre className="pre pre__green">{JSON.stringify(example.data, null, 2)}</pre>}
    </div>
  );
};

export default DataFetchRedux;
