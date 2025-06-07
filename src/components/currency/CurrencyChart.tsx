'use client'

import React from 'react'
import { useTheme } from '@mui/material/styles'

interface CurrencyChartProps {
  data: number[]
  height?: number
  width?: number
}

const CurrencyChart: React.FC<CurrencyChartProps> = ({ data, height = 60, width = 240 }) => {
  const theme = useTheme()

  if (!data || data.length === 0) {
    return (
      <div style={{ width, height, backgroundColor: theme.palette.background.paper, borderRadius: 8 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.palette.text.secondary,
          fontSize: 12
        }}>
          Нет данных
        </div>
      </div>
    )
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const isIncreasing = data[data.length - 1] > data[0]
  const strokeColor = isIncreasing ? '#4ADE80' : '#F87171'

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - 20) + 10
    const y = height - 10 - ((value - min) / range) * (height - 20)
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ width, height, position: 'relative' }}>
      <svg width={width} height={height} style={{ borderRadius: 8 }}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 10"
              fill="none"
              stroke={theme.palette.divider}
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Chart line */}
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          points={points}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            strokeLinecap: 'round',
            strokeLinejoin: 'round'
          }}
        />

        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * (width - 20) + 10
          const y = height - 10 - ((value - min) / range) * (height - 20)
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={strokeColor}
              style={{
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}

export default CurrencyChart
