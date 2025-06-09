import { Router } from 'express';
import { ExpenseController } from '../controllers/expenseController';

const router = Router();

// Получение списка расходов
router.get('/expenses', ExpenseController.getExpenses);

// Создание нового расхода
router.post('/expenses', ExpenseController.createExpense);

// Получение категорий расходов
router.get('/expenses/categories', ExpenseController.getCategories);

// Получение статистики расходов
router.get('/expenses/stats', ExpenseController.getExpenseStats);

// Получение конкретного расхода по ID
router.get('/expenses/:id', ExpenseController.getExpenseById);

// Обновление расхода
router.put('/expenses/:id', ExpenseController.updateExpense);

// Удаление расхода
router.delete('/expenses/:id', ExpenseController.deleteExpense);

// Массовое удаление расходов
router.post('/expenses/bulk-delete', ExpenseController.bulkDeleteExpenses);

export default router;
