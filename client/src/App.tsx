import React, { useState } from 'react';
import Chart from './components/chart/Chart';
import Configuration from './components/configuration/Configuration';
import styles from './App.module.scss';

const App = () => {
  const [config, setConfig] = useState({
    selectedStocks: [] as string[],
    priceType: 'c' as 'o' | 'h' | 'l' | 'c',
    dateRange: { from: '', to: '' },
  });
  const [submitted, setSubmitted] = useState(false);

  const handleConfigChange = (newConfig: Partial<typeof config>) => {
    setConfig((prevConfig) => {
      const updatedConfig = { ...prevConfig, ...newConfig };
      setSubmitted(false);
      return updatedConfig;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

const isValidConfig = config.selectedStocks.length > 0 && config.dateRange.from && config.dateRange.to;

  return (
    <div className={styles['app']}>
      <div className={styles['app__title']}>
        <h1>Stock Tracker</h1>
      </div>
      <div className={styles['app__sections']}>
        <Configuration
          config={config}
          onChange={handleConfigChange}
          onSubmit={handleSubmit}
        />
        {isValidConfig ? (
          <Chart
            config={config}
            submitted={submitted}
          />
        ) : (
          <div className={styles['default']}>
            <h2>You have not selected any stocks</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
