import { Request, Response } from 'express'
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

    res.json({
      success: true,
      data: {
        purchases,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
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

// Обновление статуса закупки (для будущего использования)
export const updatePurchaseStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // Здесь можно добавить поле status в модель Purchase
    // и обновлять его при изменении статуса в Telegram

    res.json({
      success: true,
      message: 'Функционал в разработке'
    })
  } catch (error) {
    console.error('Ошибка обновления статуса:', error)
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления статуса'
    })
  }
}
