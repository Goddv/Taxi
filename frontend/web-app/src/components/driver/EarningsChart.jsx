// frontend/web-app/src/components/driver/EarningsChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const EarningsChart = ({ data, timeRange }) => {
  const getChartData = () => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Earnings',
            data: [],
            fill: false,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            tension: 0.4,
          },
        ],
      };
    }
    
    // Process data based on time range
    let processedData = [];
    let labels = [];
    
    switch (timeRange) {
      case 'today':
        // Group by hour
        processedData = Array(24).fill(0);
        labels = Array(24).fill().map((_, i) => `${i}:00`);
        
        data.forEach(item => {
          const date = new Date(item.date);
          const hour = date.getHours();
          processedData[hour] += item.amount;
        });
        break;
        
      case 'week':
        // Group by day of week
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        processedData = Array(7).fill(0);
        labels = daysOfWeek;
        
        data.forEach(item => {
          const date = new Date(item.date);
          const dayOfWeek = date.getDay();
          processedData[dayOfWeek] += item.amount;
        });
        break;
        
      case 'month':
        // Group by day of month
        const daysInMonth = 31; // Maximum
        processedData = Array(daysInMonth).fill(0);
        labels = Array(daysInMonth).fill().map((_, i) => `${i + 1}`);
        
        data.forEach(item => {
          const date = new Date(item.date);
          const dayOfMonth = date.getDate() - 1;
          processedData[dayOfMonth] += item.amount;
        });
        break;
        
      default:
        processedData = data.map(item => item.amount);
        labels = data.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString();
        });
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Earnings',
          data: processedData,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          tension: 0.4,
        },
      ],
    };
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };
  
  return <Line data={getChartData()} options={options} />;
};

export default EarningsChart;