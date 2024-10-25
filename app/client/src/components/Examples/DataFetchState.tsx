import React, { useState} from 'react';
import axios from 'axios';

import { t } from '@plugins/i18n';

const DataFetchState: React.FC = () => {
  /**
   * useState example
   */
  const [results, setResults] = useState({});
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const fetchDataWithAxios = async ():Promise<void> => {
    setResultsLoading(true);
    try {
      setError(null);
      const { data } = await axios.get('/example/data');
      setResults(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setResultsLoading(false);
    }

    setResultsLoading(false);
  };

  return (
    <>
      <div className="card">
        <h5>{t('Data fetch with useState()')}</h5>

        {/* Render Button until we receive data */}
        {!Object.keys(results).length && (
          <div>
            <button
              className="btn btn-warning"
              type="button"
              onClick={fetchDataWithAxios}
              disabled={resultsLoading}
            >
              {t('Run example')}
            </button>
          </div>
        )}

        {/* Error message */}
        {error && <div style={{ marginTop: '1rem', color: 'red' }}>{error}</div>}

        {/* Loading message*/}
        {resultsLoading && <div style={{ marginTop: '1rem' }}>{t('Loading...')}</div>}

        {/* Results */}
        <ul className="example-list" data-testid="example-list">
          {!resultsLoading && !error && Object.entries(results).map(([key, value]) => (
            <li key={key} data-testid="example-item">
              <span>{key}: </span>
              <span style={{marginLeft: '0.25rem'}}>{value as string}</span>
            </li>
          ))}
        </ul>

        {/* Results in JSON format */}
        {!!Object.keys(results).length && <pre className="pre pre__yellod">{JSON.stringify(results, null, 2)}</pre>}
      </div>
    </>
  );
};

export default DataFetchState;
