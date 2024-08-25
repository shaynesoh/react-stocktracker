export interface ConfigurationProps {
    config: {
        selectedStocks: string[];
        priceType: 'o' | 'h' | 'l' | 'c';
        dateRange: { from: string; to: string };
    };
    onChange: (newConfig: Partial<ConfigurationProps['config']>) => void;
    onSubmit: () => void;
}

export type PriceTypeOption = { value: 'o' | 'h' | 'l' | 'c'; label: string };