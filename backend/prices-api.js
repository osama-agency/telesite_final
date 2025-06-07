const express = require('express')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')

const app = express()
const PORT = 3012

// Middleware
app.use(cors())
app.use(express.json())

// Путь к файлу с ценами
const PRICES_FILE = path.join(__dirname, 'data', 'average_prices.json')

// Убеждаемся что папка data существует
const ensureDataDir = async () => {
  const dataDir = path.dirname(PRICES_FILE)
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // Папка уже существует
  }
}

// Загрузка цен из файла
const loadPrices = async () => {
  try {
    const data = await fs.readFile(PRICES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.log('Файл цен не найден, создаем новый')
    return {}
  }
}

// Сохранение цен в файл
const savePrices = async (prices) => {
  await ensureDataDir()
  await fs.writeFile(PRICES_FILE, JSON.stringify(prices, null, 2))
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Prices API',
    timestamp: new Date().toISOString()
  })
})

// Получить все средние цены
app.get('/api/prices', async (req, res) => {
  try {
    const prices = await loadPrices()
    res.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Ошибка получения цен:', error)
    res.status(500).json({
      success: false,
      error: 'Ошибка получения цен'
    })
  }
})

// Получить среднюю цену конкретного товара
app.get('/api/prices/:productName', async (req, res) => {
  try {
    const { productName } = req.params
    const prices = await loadPrices()
    const productPrice = prices[productName]

    if (productPrice) {
      res.json({
        success: true,
        data: productPrice,
        timestamp: new Date().toISOString()
      })
    } else {
      res.status(404).json({
        success: false,
        error: 'Цена товара не найдена'
      })
    }
  } catch (error) {
    console.error('Ошибка получения цены товара:', error)
    res.status(500).json({
      success: false,
      error: 'Ошибка получения цены товара'
    })
  }
})

// Сохранить/обновить среднюю цену товара
app.post('/api/prices/:productName', async (req, res) => {
  try {
    const { productName } = req.params
    const { averagePrice, salesCount, period, source } = req.body

    if (!averagePrice || averagePrice <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Некорректная цена'
      })
    }

    const prices = await loadPrices()

    prices[productName] = {
      averagePrice: parseFloat(averagePrice),
      lastUpdated: new Date().toISOString(),
      salesCount: salesCount || 0,
      period: period || 'не указан',
      source: source || 'API'
    }

    await savePrices(prices)

    console.log(`💰 Обновлена цена "${productName}": ${averagePrice}₽`)

    res.json({
      success: true,
      message: 'Цена сохранена',
      data: prices[productName]
    })
  } catch (error) {
    console.error('Ошибка сохранения цены:', error)
    res.status(500).json({
      success: false,
      error: 'Ошибка сохранения цены'
    })
  }
})

// Массовое обновление цен
app.post('/api/prices/bulk', async (req, res) => {
  try {
    const { prices: newPrices } = req.body

    if (!newPrices || typeof newPrices !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Некорректные данные цен'
      })
    }

    const existingPrices = await loadPrices()
    let updatedCount = 0

    for (const [productName, priceData] of Object.entries(newPrices)) {
      if (priceData.averagePrice && priceData.averagePrice > 0) {
        existingPrices[productName] = {
          averagePrice: parseFloat(priceData.averagePrice),
          lastUpdated: new Date().toISOString(),
          salesCount: priceData.salesCount || 0,
          period: priceData.period || 'не указан',
          source: priceData.source || 'bulk update'
        }
        updatedCount++
      }
    }

    await savePrices(existingPrices)

    console.log(`💰 Массовое обновление: ${updatedCount} цен`)

    res.json({
      success: true,
      message: `Обновлено ${updatedCount} цен`,
      updatedCount
    })
  } catch (error) {
    console.error('Ошибка массового обновления цен:', error)
    res.status(500).json({
      success: false,
      error: 'Ошибка массового обновления цен'
    })
  }
})

// Удалить цену товара
app.delete('/api/prices/:productName', async (req, res) => {
  try {
    const { productName } = req.params
    const prices = await loadPrices()

    if (prices[productName]) {
      delete prices[productName]
      await savePrices(prices)

      console.log(`🗑️ Удалена цена "${productName}"`)

      res.json({
        success: true,
        message: 'Цена удалена'
      })
    } else {
      res.status(404).json({
        success: false,
        error: 'Цена товара не найдена'
      })
    }
  } catch (error) {
    console.error('Ошибка удаления цены:', error)
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления цены'
    })
  }
})

// Запуск сервера
app.listen(PORT, () => {
  console.log('💰 Prices API Server running on http://localhost:' + PORT)
  console.log('📊 Health check: http://localhost:' + PORT + '/health')
  console.log('📋 Prices API: http://localhost:' + PORT + '/api/prices')
  console.log('💾 Data file: ' + PRICES_FILE)
})

module.exports = app
