import React from 'react';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

interface PieChartProps {
    data: number[];
    labels: string[];
    title: string;
}

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
    const pieChartColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40',
        '#C9C9C9', '#9966FF', '#FF66B2', '#FFB6C1', '#8E44AD',
    ];

    const chartData = {
        labels: [],
        datasets: [
            {
                data: data,
                backgroundColor: pieChartColors,
                hoverBackgroundColor: pieChartColors,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: title,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) => {
                        return `¥${tooltipItem.raw.toLocaleString()}`;
                    },
                },
            },
            datalabels: {
                display: false,
            },
        },
    };

    return <Pie data={chartData} options={chartOptions} />;
};

export default PieChart;
