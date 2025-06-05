'use client'

// React Imports
import { useMemo } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// ApexCharts Imports
import type { ApexOptions } from 'apexcharts'

// Dynamic import with SSR disabled
const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

interface LineChartProps {
  series: ApexAxisChartSeries
  categories: string[]
  color?: string
  height?: number
}

const LineChart = ({ series, categories, color = '#DF4C9D', height = 100 }: LineChartProps) => {
  // Hooks
  const theme = useTheme()

  // Chart options
  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        parentHeightOffset: 0,
        toolbar: { show: false },
        sparkline: { enabled: true },
        animations: {
          enabled: true,
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
        width: 2,
        curve: 'smooth'
      },
      colors: [color],
      grid: {
        show: false,
        padding: {
          top: 5,
          bottom: 5,
          left: 5,
          right: 5
        }
      },
      xaxis: {
        categories,
        labels: { show: false },
        axisTicks: { show: false },
        axisBorder: { show: false }
      },
      yaxis: {
        labels: { show: false }
      },
      tooltip: {
        enabled: true,
        theme: theme.palette.mode,
        style: {
          fontSize: '12px'
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: () => ''
          }
        },
        marker: {
          show: true
        }
      },
      theme: {
        mode: theme.palette.mode
      }
    }),
    [categories, color, theme.palette.mode]
  )

  return <ReactApexcharts type='line' height={height} series={series} options={options} />
}

export default LineChart
