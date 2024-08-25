export interface ChartProps {
    config: {
        selectedStocks: string[];
        priceType: 'o' | 'h' | 'l' | 'c';
        dateRange: { from: string; to: string };
    };
}