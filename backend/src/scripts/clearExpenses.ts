import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTestExpenses() {
  try {
    console.log('Удаление всех тестовых записей расходов...');

    // Удаляем все записи расходов
    const deleteResult = await prisma.expense.deleteMany({});
    console.log(`✅ Удалено записей: ${deleteResult.count}`);

    // Проверяем что база очищена
    const remainingExpenses = await prisma.expense.findMany();
    console.log(`📊 Оставшиеся записи расходов: ${remainingExpenses.length}`);

    if (remainingExpenses.length === 0) {
      console.log('✅ База данных расходов очищена полностью');
    }

  } catch (error) {
    console.error('Ошибка при очистке расходов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTestExpenses();
