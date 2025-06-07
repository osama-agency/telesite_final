'use client'

import React from 'react'

import { Box } from '@mui/material'

interface SparklineProps {
  data: number[]
  change: number
  width?: number
  height?: number
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  change,
  width = 80,
  height = 24
}) => {
  if (!data || data.length === 0) {
    return <Box width={width} height={height} />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Создаем path для SVG линии
  const pathData = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`
    })
    .join(' ')

  const color = change >= 0 ? '#4ADE80' : '#F87171'

  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
          }}
        />
        {/* Точки на концах */}
        <circle
          cx={(0 / (data.length - 1)) * width}
          cy={height - ((data[0] - min) / range) * height}
          r="2"
          fill={color}
          opacity="0.7"
        />
        <circle
          cx={((data.length - 1) / (data.length - 1)) * width}
          cy={height - ((data[data.length - 1] - min) / range) * height}
          r="2"
          fill={color}
        />
      </svg>
    </Box>
  )
}

export default Sparkline
