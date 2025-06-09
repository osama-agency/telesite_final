import { NextRequest } from 'next/server'

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7234567890:AAHdqTcvbXYqJQAI0_BoJi7BdPSUvokOEzk'
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1002345678901'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, type = 'info' } = body

    if (!message) {
      return Response.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Format message based on type
    let formattedMessage = ''
    const timestamp = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    switch (type) {
      case 'purchase':
        formattedMessage = `🛒 *НОВАЯ ЗАКУПКА*\n\n${message}\n\n📅 ${timestamp}`
        break
      case 'success':
        formattedMessage = `✅ *УСПЕХ*\n\n${message}\n\n📅 ${timestamp}`
        break
      case 'warning':
        formattedMessage = `⚠️ *ВНИМАНИЕ*\n\n${message}\n\n📅 ${timestamp}`
        break
      case 'error':
        formattedMessage = `❌ *ОШИБКА*\n\n${message}\n\n📅 ${timestamp}`
        break
      case 'info':
      default:
        formattedMessage = `ℹ️ *ИНФОРМАЦИЯ*\n\n${message}\n\n📅 ${timestamp}`
        break
    }

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: formattedMessage,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    })

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json()
      console.error('Telegram API error:', errorData)
      return Response.json(
        { success: false, error: 'Failed to send Telegram message', details: errorData },
        { status: 500 }
      )
    }

    const telegramData = await telegramResponse.json()

    return Response.json({
      success: true,
      message: 'Telegram notification sent successfully',
      data: telegramData
    })

  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
