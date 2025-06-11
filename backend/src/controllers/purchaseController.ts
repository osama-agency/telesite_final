import type { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Схема валидации для создания закупки
const createPurchaseSchema = z.object({
  isUrgent: z.boolean().optional(),
  items: z.array(z.object({
    productId: z.number().nullable().optional(),
    name: z.string(),
    quantity: z.number().positive(),
    price: z.number().positive(),
    total: z.number().positive()
  })).min(1)
})

// Создание новой закупки
export const createPurchase = async (req: Request, res: Response) => {
  try {
    // Валидация входных данных
    const validatedData = createPurchaseSchema.parse(req.body)

    // Расчет общей суммы
    const totalCost = validatedData.items.reduce((sum, item) => sum + item.total, 0)

    // Создание закупки с позициями в транзакции
    const purchase = await prisma.purchase.create({
      data: {
        totalCost,
        isUrgent: validatedData.isUrgent || false,
        items: {
          create: validatedData.items.map(item => ({
            productId: item.productId || null,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          }))
        }
      },
      include: {
        items: true
      }
    })

    console.log(`Создана новая закупка #${purchase.id} на сумму ${totalCost} ₽`)

    res.status(201).json({
      success: true,
      data: purchase
    })
  } catch (error) {
    console.error('Ошибка создания закупки:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Неверные данные',
        details: error.errors
      })
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка создания закупки'
    })
  }
}

// Получение списка закупок
export const getPurchases = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Фильтры
    const isUrgent = req.query.isUrgent === 'true' ? true :
                     req.query.isUrgent === 'false' ? false : undefined

    const where: any = {}
    if (isUrgent !== undefined) {
      where.isUrgent = isUrgent
    }

    // Получаем закупки с пагинацией

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          items: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.purchase.count({ where })
    ])

    // Преобразуем данные для фронтенда
    const transformedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      sequenceId: purchase.sequenceId,
      date: purchase.createdAt.toISOString(),
      statusUpdatedAt: purchase.statusUpdatedAt.toISOString(),
      supplier: purchase.supplier || (purchase.isUrgent ? '🔥 Срочная закупка' : 'Основной поставщик'),
      items: purchase.items.map(item => ({
        id: item.id,
        product: {
          id: item.productId || 0,
          name: item.name,
          sku: `SKU-${item.productId || 0}`,
          currentStock: 0 // Можно дополнить запросом к товарам
        },
        quantity: item.quantity,
        costTry: parseFloat(item.price.toString()),
        costRub: parseFloat(item.price.toString()) * 2.13, // Используем текущий курс
        totalRub: parseFloat(item.total.toString())
      })),
      totalAmount: parseFloat(purchase.totalCost.toString()),
      logisticsCost: parseFloat(purchase.logisticsCost.toString()),
      status: purchase.status as 'pending' | 'paid' | 'in_transit' | 'delivering' | 'received' | 'cancelled',
      isUrgent: purchase.isUrgent
    }))

    res.json({
      success: true,
      data: transformedPurchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Ошибка получения закупок:', error)
    res.status(500).json({
      success: false,
      error: 'Ошибка получения списка закупок'
    })
  }
}

// Получение деталей закупки
export const getPurchaseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        items: true
      }
    })

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Закупка не найдена'
      })
    }

    res.json({
      success: true,
      data: purchase
    })
  } catch (error) {
    console.error('Ошибка получения закупки:', error)
    res.status(500).json({
      success: false,
      error: 'Ошибка получения деталей закупки'
    })
  }
}

// Обновление статуса закупки
export const updatePurchaseStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // Валидация статуса

    const validStatuses = ['pending', 'paid', 'in_transit', 'delivering', 'received', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Некорректный статус. Доступные: ${validStatuses.join(', ')}`
      })
    }

        const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        status,
        statusUpdatedAt: new Date()
      },
      include: { items: true }
    })

    console.log(`📋 Статус закупки #${purchase.sequenceId} обновлен на "${status}"`)

    res.json({
      success: true,
      data: purchase,
      message: `Статус закупки обновлен на "${status}"`
    })
  } catch (error: any) {
    console.error('Ошибка обновления статуса:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Закупка не найдена'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка обновления статуса'
    })
  }
}
