import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody } from 'react-bootstrap';
import './LineChart.css';

const LineChart = ({ 
  chartData = [], 
  chartOptions = {}, 
  title,
  height = 350,
  className = '',
  ...props 
}) => {
  const [chartState, setChartState] = useState({
    series: chartData,
    options: {
      chart: {
        type: 'line',
        height: height,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        }
      },
      markers: {
        size: 5,
        hover: {
          size: 7
        }
      },
      xaxis: {
        type: 'category',
        labels: {
          style: {
            colors: '#6c757d',
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#6c757d',
            fontSize: '12px'
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px'
        }
      },
      ...chartOptions
    }
  });

  useEffect(() => {
    setChartState(prev => ({
      ...prev,
      series: chartData,
      options: {
        ...prev.options,
        ...chartOptions
      }
    }));
  }, [chartData, chartOptions]);

  return (
    <Card className={`line-chart-card ${className}`} {...props}>
      {title && (
        <CardBody className="pb-0">
          <h6 className="card-title mb-0">{title}</h6>
        </CardBody>
      )}
      <CardBody className={title ? 'pt-0' : ''}>
        <div className="chart-container">
          <ReactApexChart
            options={chartState.options}
            series={chartState.series}
            type="line"
            height={height}
            width="100%"
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default LineChart;
