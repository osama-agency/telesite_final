'use client'

import { Box, Typography, Button } from '@mui/material'
import { useState } from 'react'

export default function TestPage() {
  const [apiResult, setApiResult] = useState<string>('')

  const testBackendAPI = async () => {
    try {
      const response = await fetch('http://localhost:3011/health')
      const data = await response.json()
      setApiResult(`Backend API работает: ${JSON.stringify(data)}`)
    } catch (error) {
      setApiResult(`Ошибка API: ${error}`)
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Тестовая страница
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Если вы видите эту страницу, фронтенд работает корректно!
      </Typography>

      <Button
        variant="contained"
        onClick={testBackendAPI}
        sx={{ mb: 2 }}
      >
        Тестировать Backend API
      </Button>

      {apiResult && (
        <Box sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="body2">
            {apiResult}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
