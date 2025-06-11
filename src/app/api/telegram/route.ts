import { NextRequest } from 'next/server'

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M'
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-4729817036'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, type = 'info', purchaseId, currentStatus } = body

    console.log('📨 Получен запрос в Telegram API:', {
      type,
      purchaseId,
      currentStatus,
      messageLength: message?.length
    })

    if (!message) {
      console.error('❌ Сообщение не предоставлено')
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
        if (currentStatus === 'cancelled') {
          formattedMessage = `~🛒 НОВАЯ ЗАКУПКА~\n\n~${message}~\n\n❌ *ЗАКАЗ ОТМЕНЁН*\n\n📅 ${timestamp}`
        } else {
          formattedMessage = `🛒 *НОВАЯ ЗАКУПКА*\n\n${message}\n\n📅 ${timestamp}`
        }
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

    // Prepare request body
    const telegramBody: any = {
      chat_id: TELEGRAM_CHAT_ID,
      text: formattedMessage,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    }

    // Add inline keyboard for purchase messages (only if not cancelled)
    if (type === 'purchase' && purchaseId && currentStatus && currentStatus !== 'cancelled') {
      const statusButtons = []

      // Create buttons based on current status
      switch (currentStatus) {
        case 'pending':
          statusButtons.push(
            { text: '💰 Оплачено', callback_data: `status_${purchaseId}_paid` },
            { text: '❌ Отменить', callback_data: `status_${purchaseId}_cancelled` }
          )
          break
        case 'paid':
          statusButtons.push(
            { text: '🚚 В пути', callback_data: `status_${purchaseId}_in_transit` },
            { text: '❌ Отменить', callback_data: `status_${purchaseId}_cancelled` }
          )
          break
        case 'in_transit':
          statusButtons.push({ text: '🚛 Доставляется', callback_data: `status_${purchaseId}_delivering` })
          break
        case 'delivering':
          statusButtons.push({ text: '✅ Получено', callback_data: `status_${purchaseId}_received` })
          break
        case 'received':
          // Финальный статус - кнопок нет
          break
      }

      if (statusButtons.length > 0) {
        telegramBody.reply_markup = {
          inline_keyboard: [statusButtons]
        }
      }
    }

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramBody)
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
    console.log('✅ Сообщение успешно отправлено в Telegram:', telegramData)

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
