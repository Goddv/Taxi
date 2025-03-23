// frontend/web-app/src/components/admin/BookingChart.jsx
import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Component for displaying various booking-related charts in the admin dashboard
 * Supports line charts, bar charts, and doughnut charts with customizable data
 */
const BookingChart = ({ 
  type = 'line', 
  data, 
  labels, 
  title = '', 
  height = 300, 
  datasets = [],
  options = {} 
}) => {
  // Default options for different chart types
  const defaultOptions = {
    line: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: !!title,
          text: title
        }
      }
    },
    bar: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: !!title,
          text: title
        }
      }
    },
    doughnut: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: !!title,
          text: title
        }
      }
    }
  };
  
  // Merge default options with custom options
  const mergedOptions = {
    ...defaultOptions[type],
    ...options
  };
  
  // Format chart data
  const chartData = {
    labels: labels || [],
    datasets: datasets.length ? datasets : [
      {
        data: data || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Render appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={mergedOptions} height={height} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={mergedOptions} height={height} />;
      case 'line':
      default:
        return <Line data={chartData} options={mergedOptions} height={height} />;
    }
  };
  
  return (
    <div style={{ height: height }}>
      {renderChart()}
    </div>
  );
};

// Utility function to create custom datasets configuration
export const createDataset = (label, data, color, fill = false) => {
  return {
    label,
    data,
    backgroundColor: fill ? `rgba(${color}, 0.2)` : `rgba(${color}, 1)`,
    borderColor: `rgba(${color}, 1)`,
    fill,
    tension: 0.4
  };
};

export default BookingChart;