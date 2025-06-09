'use client'

import React from 'react'
import { Button } from '@mui/material'

const TestDatePicker = () => {
  const handleClick = () => {
    alert('Кнопка работает!')
    console.log('🎯 Test button clicked!')
  }

  return (
    <Button
      variant="outlined"
      onClick={handleClick}
      sx={{
        minWidth: 200,
        height: 48,
        textTransform: 'none',
      }}
    >
      📅 Тестовая кнопка
    </Button>
  )
}

export default TestDatePicker 