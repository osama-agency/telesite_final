import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Данные себестоимости в лирах из таблицы
const productCostData = [
  { name: 'Atominex 10 mg', costTRY: 455 },
  { name: 'Abilify 15 mg', costTRY: 430 },
  { name: 'Attex 100 mg', costTRY: 1170 },
  { name: 'Atominex 25 mg', costTRY: 765 },
  { name: 'Atominex 60 mg', costTRY: 595 },
  { name: 'Atominex 40 mg', costTRY: 416 },
  { name: 'Atominex 18 mg', costTRY: 605 },
  { name: 'Atominex 80 mg', costTRY: 770 },
  { name: 'Attex 4 mg (сироп)', costTRY: 280 },
  { name: 'Attex 10 mg', costTRY: 420 },
  { name: 'Atominex 100 mg', costTRY: 970 },
  { name: 'Attex 18 mg', costTRY: 740 },
  { name: 'Attex 80 mg', costTRY: 960 },
  { name: 'HHS A1 L-Carnitine Lepidium', costTRY: 280 },
  { name: 'Мирена 20 мкг/24 часа', costTRY: 1300 },
  { name: 'Arislow 1 mg', costTRY: 255 },
  { name: 'Arislow 2 mg', costTRY: 285 },
  { name: 'Arislow 3 mg', costTRY: 310 },
  { name: 'Arislow 4 mg', costTRY: 340 },
  { name: 'Attex 25 mg', costTRY: 797 },
  { name: 'Attex 40 mg', costTRY: 493 },
  { name: 'Attex 60 mg', costTRY: 730 },
  { name: 'Abilify 5 mg', costTRY: 380 },
  { name: 'Risperdal 1 Mg/ml сироп', costTRY: 240 },
  { name: 'Salazopyrin 500 mg', costTRY: 220 },
  { name: 'Eutyrox 100 mcg', costTRY: 105 }
]

async function importProductPrices() {
  console.log('🚀 Начинаем импорт себестоимости товаров в лирах...')

  try {
    // Получаем текущий курс валют (примерный)
    const exchangeRate = 2.13 // 1 TRY = 2.13 RUB (с буфером)

    let updatedCount = 0
    let notFoundProducts: string[] = []

    for (const item of productCostData) {
      try {
        // Ищем товар по имени
        const product = await prisma.product.findFirst({
          where: {
            name: {
              contains: item.name,
              mode: 'insensitive'
            }
          }
        })

        if (product) {
          // Обновляем себестоимость в лирах
          await prisma.product.update({
            where: { id: product.id },
            data: {
              costPriceTRY: item.costTRY,
              costPrice: item.costTRY * exchangeRate // Обновляем и рублевую себестоимость
            }
          })

          // Создаем запись в истории цен
          await prisma.productPrice.create({
            data: {
              productId: product.id,
              costPriceTRY: item.costTRY,
              costPriceRUB: item.costTRY * exchangeRate,
              retailPrice: product.price,
              exchangeRate: exchangeRate,
              effectiveDate: new Date()
            }
          })

          console.log(`✅ Обновлен товар: ${product.name} - ${item.costTRY} ₺`)
          updatedCount++
        } else {
          notFoundProducts.push(item.name)
        }
      } catch (error) {
        console.error(`❌ Ошибка при обновлении товара ${item.name}:`, error)
      }
    }

    console.log(`\n📊 Результаты импорта:`)
    console.log(`✅ Успешно обновлено: ${updatedCount} товаров`)

    if (notFoundProducts.length > 0) {
      console.log(`\n⚠️ Не найдены следующие товары:`)
      notFoundProducts.forEach(name => console.log(`  - ${name}`))
    }

  } catch (error) {
    console.error('❌ Ошибка при импорте:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем импорт
importProductPrices()
  .then(() => console.log('\n✨ Импорт завершен'))
  .catch(console.error)
