import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { ChartProps } from './Chart.types';
import styles from './Chart.module.scss';
import { fetchStockData } from '../../services/polygonAPI';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Chart = ({ config, submitted }: ChartProps & { submitted: boolean }) => {
  const [chartData, setChartData] = useState<any>({ datasets: [] });
  const [error, setError] = useState<string | null>(null);

  const colors = ['#063970', '#e1426f', '#008000'];

  const fetchData = async () => {
    try {
      const promises = config.selectedStocks.map(stock =>
        fetchStockData(stock, config.dateRange.from, config.dateRange.to)
      );
      const results = await Promise.all(promises);

      const datasets = results
        .map((data, index) => {
          if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
            const prices = data.results.map((result: any) => result[config.priceType]);
            const color = colors[index % colors.length];

            return {
              label: config.selectedStocks[index],
              data: prices,
              borderColor: color,
              backgroundColor: color,
              fill: false,
            };
          }
          return null;
        })
        .filter(dataset => dataset !== null);

      if (datasets.length > 0) {
        const firstResults = results.find(data => data && data.results && Array.isArray(data.results));
        if (firstResults && firstResults.results && Array.isArray(firstResults.results)) {
          setChartData({
            labels: firstResults.results.map((result: any) => new Date(result.t).toLocaleDateString()),
            datasets,
          });
          setError(null);
        } else {
          setError('No data available for the selected stocks.');
          setChartData({ datasets: [] });
        }
      } else {
        setError('No data available for the selected stocks.');
        setChartData({ datasets: [] });
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      if (error instanceof Error && error.message === 'Rate limit exceeded') {
        setError('You have exceeded 5 API calls per minute.');
      } else {
        setError('Failed to fetch stock data.');
      }
      setChartData({ datasets: [] });
    }
  };


  useEffect(() => {
    if (!submitted) return;
    if (config.selectedStocks.length === 0 || !config.dateRange.from || !config.dateRange.to) return;
    fetchData();
  }, [submitted]);

  return (
    <section className={styles['chart']}>
      {error ? (
        <div className={styles['chart__error']}><h2>{error}</h2></div>
      ) : (
        <Line data={chartData} />
      )}
    </section>
  );
};

export default Chart;
