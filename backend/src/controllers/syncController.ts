import type { Request, Response } from 'express';
import axios from 'axios';

import { prisma } from '../lib/prisma';
import type { ExternalOrder } from '../types';

export const getOrdersStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo } = req.query;

    // Строим фильтр по датам
    const where: any = {};
    if (dateFrom || dateTo) {
      where.orderDate = {};
      if (dateFrom) {
        where.orderDate.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.orderDate.lte = new Date(dateTo as string);
      }
    }

    // Получаем статистику
    const [totalOrders, totalRevenue, ordersByStatus, recentOrders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: {
          total: true
        }
      }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: {
          id: true
        }
      }),
      prisma.order.findMany({
        where,
        include: {
          items: true
        },
        orderBy: {
          orderDate: 'desc'
        },
        take: 5
      })
    ]);

    const response = {
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        ordersByStatus: ordersByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        recentOrders
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching orders stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, dateFrom, dateTo, sortBy = 'orderDate', sortOrder = 'DESC' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Строим фильтр по датам
    const where: any = {};
    if (dateFrom || dateTo) {
      where.orderDate = {};
      if (dateFrom) {
        where.orderDate.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.orderDate.lte = new Date(dateTo as string);
      }
    }

    // Получаем заказы с элементами
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true
        },
        orderBy: {
          [sortBy as string]: sortOrder === 'DESC' ? 'desc' : 'asc'
        },
        skip,
        take: limitNum
      }),
      prisma.order.count({ where })
    ]);

    const response = {
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const syncOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Starting sync orders...');

    const { authorization } = req.headers;

    if (!authorization) {
      res.status(400).json({
        success: false,
        error: 'Authorization header is required'
      });
      return;
    }

    const apiUrl = process.env.STRATTERA_API_URL;
    if (!apiUrl) {
      res.status(500).json({
        success: false,
        error: 'STRATTERA_API_URL is not configured'
      });
      return;
    }

    // Получаем данные с внешнего API
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': authorization
      }
    });

    const externalOrders: ExternalOrder[] = response.data;
    let importedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    console.log(`Received ${externalOrders.length} orders from external API`);

    // Обрабатываем каждый заказ
    for (let i = 0; i < externalOrders.length; i++) {
      const externalOrder = externalOrders[i];

      // Логируем прогресс каждые 100 заказов
      if (i % 100 === 0) {
        console.log(`Processing order ${i + 1}/${externalOrders.length} (ID: ${externalOrder.id})`);
      }

      try {
        const totalAmount = parseFloat(externalOrder.total_amount);

                // Выбираем дату: если paid_at == null, то используем created_at
        const dateString = externalOrder.paid_at || externalOrder.created_at;

        // Парсим дату в формате "05.06.2025 21:31:26"
        const dateParts = dateString.split(' ');
        const [day, month, year] = dateParts[0].split('.');
        const [hours, minutes, seconds] = dateParts[1].split(':');
        const orderDate = new Date(
          parseInt(year),
          parseInt(month) - 1, // месяцы в JavaScript начинаются с 0
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds)
        );

        if (isNaN(totalAmount)) {
          console.warn(`Skipping order ${externalOrder.id}: invalid total_amount "${externalOrder.total_amount}"`);
          skippedCount++;
          continue;
        }

        if (isNaN(orderDate.getTime())) {
          console.warn(`Skipping order ${externalOrder.id}: invalid created_at "${externalOrder.created_at}"`);
          skippedCount++;
          continue;
        }

        await prisma.order.upsert({
          where: {
            externalId: externalOrder.id.toString()
          },
          update: {
            customerName: externalOrder.user.full_name,
            customerEmail: null, // не предоставляется в API
            customerPhone: null, // не предоставляется в API
            status: externalOrder.status,
            total: totalAmount,
            currency: 'RUB', // предполагаем рубли
            orderDate: orderDate,
            updatedAt: new Date(),
            // Обновляем элементы заказа
            items: {
              deleteMany: {}, // Удаляем старые элементы
              create: externalOrder.order_items.filter(item => {
                const itemPrice = parseFloat(item.price);
                if (isNaN(itemPrice) || item.quantity <= 0) {
                  console.warn(`Skipping invalid order item in order ${externalOrder.id}: price="${item.price}", quantity=${item.quantity}`);
                  return false;
                }
                return true;
              }).map(item => {
                const itemPrice = parseFloat(item.price);
                return {
                  productId: null, // не предоставляется в API
                  name: item.name,
                  quantity: item.quantity,
                  price: itemPrice,
                  total: itemPrice * item.quantity
                };
              })
            }
          },
          create: {
            externalId: externalOrder.id.toString(),
            customerName: externalOrder.user.full_name,
            customerEmail: null,
            customerPhone: null,
            status: externalOrder.status,
            total: totalAmount,
            currency: 'RUB',
            orderDate: orderDate,
            items: {
              create: externalOrder.order_items.filter(item => {
                const itemPrice = parseFloat(item.price);
                if (isNaN(itemPrice) || item.quantity <= 0) {
                  console.warn(`Skipping invalid order item in order ${externalOrder.id}: price="${item.price}", quantity=${item.quantity}`);
                  return false;
                }
                return true;
              }).map(item => {
                const itemPrice = parseFloat(item.price);
                return {
                  productId: null,
                  name: item.name,
                  quantity: item.quantity,
                  price: itemPrice,
                  total: itemPrice * item.quantity
                };
              })
            }
          }
        });

        importedCount++;

        // Логируем первые 5 заказов для отладки
        if (i < 5) {
          console.log(`✅ Processed order ${externalOrder.id}: ${externalOrder.user.full_name}`);
        }

      } catch (orderError) {
        console.error(`Error processing order ${externalOrder.id}:`, orderError);
        errorCount++;

        // Продолжаем обработку остальных заказов
      }
    }

    console.log(`Import completed: ${importedCount} imported, ${errorCount} errors, ${skippedCount} skipped`);

    const response_data = {
      success: true,
      imported: importedCount,
      errors: errorCount,
      skipped: skippedCount,
      message: `Successfully imported ${importedCount} orders`
    };

    res.json(response_data);
  } catch (error) {
    console.error('Sync failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
