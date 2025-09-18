import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody } from 'react-bootstrap';
import './PieChart.css';

const PieChart = ({ 
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
        type: 'pie',
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
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#fa709a'],
      labels: [],
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        floating: false,
        fontSize: '14px',
        fontFamily: 'Helvetica, Arial',
        fontWeight: 400,
        formatter: function(seriesName, opts) {
          return seriesName + ": " + opts.w.globals.series[opts.seriesIndex];
        },
        offsetX: 0,
        offsetY: 0,
        labels: {
          colors: '#6c757d',
          useSeriesColors: false
        },
        markers: {
          width: 12,
          height: 12,
          strokeWidth: 0,
          radius: 12,
          customHTML: undefined,
          onClick: undefined,
          offsetX: 0,
          offsetY: 0
        },
        itemMargin: {
          horizontal: 5,
          vertical: 5
        },
        onItemClick: {
          toggleDataSeries: true
        },
        onItemHover: {
          highlightDataSeries: true
        }
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px'
        },
        y: {
          formatter: function (val) {
            return val;
          }
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#fff']
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
    <Card className={`pie-chart-card ${className}`} {...props}>
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
            type="pie"
            height={height}
            width="100%"
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default PieChart;
