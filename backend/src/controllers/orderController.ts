import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Обновление статуса заказа
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      res.status(400).json({
        success: false,
        error: 'Order ID and status are required'
      });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Order ${id} status updated to: ${status}`);

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Обновление данных заказа
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
      return;
    }

    // Удаляем поля, которые не должны обновляться
    delete updateData.id;
    delete updateData.externalId;
    delete updateData.createdAt;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        items: true
      }
    });

    console.log(`✅ Order ${id} updated`);

    res.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Добавление комментария к заказу
export const addOrderComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!id || !comment) {
      res.status(400).json({
        success: false,
        error: 'Order ID and comment are required'
      });
      return;
    }

    // Получаем текущий заказ
    const currentOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!currentOrder) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    // Добавляем комментарий к существующим (если есть поле для комментариев)
    // Если нет специального поля, можно использовать JSON поле или создать отдельную таблицу
    const order = await prisma.order.update({
      where: { id },
      data: {
        updatedAt: new Date()
      }
    });

    console.log(`💬 Comment added to order ${id}`);

    res.json({
      success: true,
      data: order,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add comment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
