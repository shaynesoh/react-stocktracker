import React, { useState, useEffect, useCallback } from 'react';
import CreatableSelect from 'react-select/creatable';
import { ConfigurationProps, PriceTypeOption } from './configuration.types';
import styles from './Configuration.module.scss';
import { searchStockNames } from '../../services/polygonAPI';
import { debounce } from '../../utils/debounce';

const priceTypeOptions: PriceTypeOption[] = [
    { value: 'o', label: 'Open' },
    { value: 'h', label: 'High' },
    { value: 'l', label: 'Low' },
    { value: 'c', label: 'Close' },
];

const Configuration = ({ config, onChange, onSubmit }: ConfigurationProps) => {
    const [error, setError] = useState<string | null>(null);
    const [stockOptions, setStockOptions] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState<string>('');
    const [validSymbols, setValidSymbols] = useState<Set<string>>(new Set(config.selectedStocks));

    const validate = () => {
        setError(null);

        if (config.selectedStocks.length === 0) {
            setError('You must select at least one stock.');
            return false;
        }

        if (config.selectedStocks.length > 3) {
            setError('You cannot select more than three stocks.');
            return false;
        }

        const currentDate = new Date().toISOString().split('T')[0];

        if (!config.dateRange.from || !config.dateRange.to) {
            setError('Please provide both From and To dates.');
            return false;
        }

        if (config.dateRange.from > config.dateRange.to) {
            setError('The "From Date" cannot be later than the "To Date".');
            return false;
        }

        if (config.dateRange.to > currentDate || config.dateRange.from > currentDate) {
            setError('The date range cannot exceed the current date.');
            return false;
        }

        return true;
    };

    const handleSubmit = (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.preventDefault();

        if (validate()) {
            onSubmit();
        }
    };

    const handleStockChange = (newValue: any) => {
        const stockSymbols = newValue.map((option: any) => option.value);
        onChange({ selectedStocks: stockSymbols });
    };

    const handlePriceTypeChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ priceType: evt.target.value as 'o' | 'h' | 'l' | 'c' });
    };

    const handleDateChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ dateRange: { ...config.dateRange, [evt.target.name]: evt.target.value } });
    };

    const handleCreateOption = (inputValue: string) => {
        if (validSymbols.has(inputValue.toUpperCase())) {
            if (config.selectedStocks.length < 3) {
                onChange({ selectedStocks: [...config.selectedStocks, inputValue.toUpperCase()] });
            } else {
                setError('You cannot select more than three stocks.');
            }
        } else {
            setError('Invalid ticker symbol.');
        }
    };

    const fetchStockOptions = useCallback(
        debounce(async (query: string) => {
            if (query.length >= 3) {
                try {
                    const results = await searchStockNames(query);
                    setStockOptions(results.map((stock: any) => ({
                        value: stock.ticker,
                        label: `${stock.name} (${stock.ticker})`
                    })));
                    setValidSymbols(new Set(results.map((stock: any) => stock.ticker)));
                } catch (error) {
                    if (error instanceof Error && error.message === 'Rate limit exceeded') {
                        setError('You have exceeded 5 API calls per minute.');
                    } else {
                        setError('Failed to fetch stock symbols.');
                    }
                }
            }
        }, 300),
        []
    );

    useEffect(() => {
        fetchStockOptions(inputValue);
    }, [inputValue, fetchStockOptions]);

    return (
        <section className={styles['configuration']}>
            <div className={styles['configuration__settings']}>
                <div className={styles['configuration__stock']}>
                    <label>Enter Ticker Symbol (up to 3)</label>
                    <CreatableSelect
                        isMulti
                        onChange={handleStockChange}
                        value={config.selectedStocks.map(stock => ({ value: stock, label: stock }))}
                        onInputChange={setInputValue}
                        options={stockOptions}
                        onCreateOption={handleCreateOption}
                        isValidNewOption={(inputValue) => validSymbols.has(inputValue.toUpperCase()) && config.selectedStocks.length < 3}
                        noOptionsMessage={() => 'Please enter a valid ticker symbol'}
                    />
                </div>
                <div className={styles['configuration__price']}>
                    <label>Select Price Type</label>
                    {priceTypeOptions.map(option => (
                        <div key={option.value} className={styles['priceTypeRadio']}>
                            <input
                                type="radio"
                                name="priceType"
                                value={option.value}
                                checked={config.priceType === option.value}
                                onChange={handlePriceTypeChange}
                            />
                            {option.label}
                        </div>
                    ))}
                </div>
                <div className={styles['configuration__date']}>
                    <label>Select Date Range</label>
                    <div className={styles['configuration__date-from']}>
                        <div>From:</div>
                        <input type="date" name="from" value={config.dateRange.from} onChange={handleDateChange} />
                    </div>
                    <div className={styles['configuration__date-to']}>
                        <div>To:</div>
                        <input type="date" name="to" value={config.dateRange.to} onChange={handleDateChange} />
                    </div>
                </div>
                {error && <div className={styles['configuration__error']}>{error}</div>}
            </div>
            <button className={styles['configuration__submit']} onClick={handleSubmit}>
                Find Stocks
            </button>
        </section>
    );
};

export default Configuration;
