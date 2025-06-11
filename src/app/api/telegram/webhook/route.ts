import { NextRequest } from 'next/server'

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle callback query (button press)
    if (body.callback_query) {
      const callbackQuery = body.callback_query
      const callbackData = callbackQuery.data
      const messageId = callbackQuery.message.message_id
      const chatId = callbackQuery.message.chat.id

      // Parse callback data: status_purchaseId_newStatus
      if (callbackData.startsWith('status_')) {
        const parts = callbackData.split('_')
        if (parts.length === 3) {
          const purchaseId = parts[1]
          const newStatus = parts[2]

          try {
            // Update purchase status in database
            const response = await fetch(`http://localhost:3000/api/purchases/${purchaseId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
              // Answer callback query
              await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  callback_query_id: callbackQuery.id,
                  text: `✅ Статус закупки #${purchaseId} обновлен`,
                  show_alert: false
                })
              })

              // Update message with new status
              const statusEmoji = {
                pending: '⏳',
                paid: '💰',
                in_transit: '🚚',
                received: '✅'
              }

              const statusText = {
                pending: 'Ожидает оплаты',
                paid: 'Оплачено',
                in_transit: 'В пути',
                received: 'Получено'
              }

              const originalText = callbackQuery.message.text
              const updatedText = originalText + `\n\n🔄 *Статус обновлен:* ${statusEmoji[newStatus as keyof typeof statusEmoji]} ${statusText[newStatus as keyof typeof statusText]}`

              // Create new inline keyboard based on new status
              const newButtons = []

              if (newStatus !== 'paid' && newStatus === 'pending') {
                newButtons.push({
                  text: '💰 Оплачено',
                  callback_data: `status_${purchaseId}_paid`
                })
              }

              if (newStatus !== 'in_transit' && newStatus === 'paid') {
                newButtons.push({
                  text: '🚚 В пути',
                  callback_data: `status_${purchaseId}_in_transit`
                })
              }

              if (newStatus !== 'received' && newStatus === 'in_transit') {
                newButtons.push({
                  text: '✅ Получено',
                  callback_data: `status_${purchaseId}_received`
                })
              }

              const editMessageBody: any = {
                chat_id: chatId,
                message_id: messageId,
                text: updatedText,
                parse_mode: 'Markdown'
              }

              if (newButtons.length > 0) {
                editMessageBody.reply_markup = {
                  inline_keyboard: [newButtons]
                }
              }

              // Edit message
              await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editMessageBody)
              })

            } else {
              // Answer callback query with error
              await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  callback_query_id: callbackQuery.id,
                  text: `❌ Ошибка обновления статуса`,
                  show_alert: true
                })
              })
            }

          } catch (error) {
            console.error('Error updating purchase status:', error)

            // Answer callback query with error
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callback_query_id: callbackQuery.id,
                text: `❌ Ошибка обновления статуса`,
                show_alert: true
              })
            })
          }
        }
      }
    }

    return Response.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
