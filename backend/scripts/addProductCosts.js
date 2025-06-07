const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Данные о себестоимости товаров в лирах из таблицы
const productCosts = [
  { name: 'Atominex 10 mg', costPrice: 455 },
  { name: 'Abilify 15 mg', costPrice: 430 },
  { name: 'Attex 100 mg', costPrice: 1170 },
  { name: 'Atominex 25 mg', costPrice: 765 },
  { name: 'Atominex 60 mg', costPrice: 595 },
  { name: 'Atominex 40 mg', costPrice: 415 },
  { name: 'Atominex 18 mg', costPrice: 605 },
  { name: 'Atominex 80 mg', costPrice: 775 },
  { name: 'Attex 4 mg (сироп)', costPrice: 720 },
  { name: 'Attex 10 mg', costPrice: 420 },
  { name: 'Atominex 100 mg', costPrice: 970 },
  { name: 'Attex 18 mg', costPrice: 740 },
  { name: 'Attex 80 mg', costPrice: 960 },
  { name: 'HHS A1 L-Carnitine Lepidium', costPrice: 280 },
  { name: 'Мирена 20 мкг/24 часа', costPrice: 1300 },
  { name: 'Arislow 1 mg', costPrice: 255 },
  { name: 'Arislow 2 mg', costPrice: 285 },
  { name: 'Arislow 3 mg', costPrice: 310 },
  { name: 'Arislow 4 mg', costPrice: 340 },
  { name: 'Attex 25 mg', costPrice: 797 },
  { name: 'Attex 40 mg', costPrice: 495 },
  { name: 'Attex 60 mg', costPrice: 730 },
  { name: 'Abilify 5 mg', costPrice: 300 },
  { name: 'Risperdal 1 Mg/ml сироп', costPrice: 245 },
  { name: 'Salazopyrin 500 mg', costPrice: 220 },
  { name: 'Euthyrox 100 mcg', costPrice: 105 }
];

async function addProductCosts() {
  console.log('🚀 Начинаю добавление себестоимости товаров...');

  try {
    // Сначала получаем данные из внешнего API для синхронизации
    console.log('📡 Загружаю товары из внешнего API...');
    const response = await fetch('https://strattera.tgapp.online/api/v1/products', {
      headers: {
        'Authorization': '8cM9wVBrY3p56k4L1VBpIBwOsw'
      }
    });

    const apiProducts = await response.json();
    console.log(`📦 Получено ${apiProducts.length} товаров из API`);

    let created = 0;
    let updated = 0;

    for (const apiProduct of apiProducts) {
      if (!apiProduct.price || apiProduct.price === null) {
        console.log(`⏭️  Пропускаю товар без цены: ${apiProduct.name}`);
        continue;
      }

      // Ищем себестоимость для этого товара
      const costData = productCosts.find(p => p.name === apiProduct.name);
      const costPrice = costData ? costData.costPrice : null;

      try {
        // Пробуем обновить существующий товар
        const existingProduct = await prisma.product.findFirst({
          where: { externalId: apiProduct.id }
        });

        if (existingProduct) {
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: apiProduct.name,
              description: apiProduct.description,
              price: parseFloat(apiProduct.price),
              costPrice: costPrice,
              stockQuantity: apiProduct.stock_quantity || 0,
              brand: apiProduct.brand,
              mainIngredient: apiProduct.main_ingredient,
              dosageForm: apiProduct.dosage_form,
              packageQuantity: apiProduct.package_quantity,
              weight: apiProduct.weight
            }
          });
          updated++;
          if (costPrice) {
            console.log(`✅ Обновлен: ${apiProduct.name} - себестоимость: ${costPrice} ₺`);
          } else {
            console.log(`📝 Обновлен: ${apiProduct.name} - без себестоимости`);
          }
        } else {
          // Создаем новый товар
          await prisma.product.create({
            data: {
              externalId: apiProduct.id,
              name: apiProduct.name,
              description: apiProduct.description,
              price: parseFloat(apiProduct.price),
              costPrice: costPrice,
              stockQuantity: apiProduct.stock_quantity || 0,
              brand: apiProduct.brand,
              mainIngredient: apiProduct.main_ingredient,
              dosageForm: apiProduct.dosage_form,
              packageQuantity: apiProduct.package_quantity,
              weight: apiProduct.weight
            }
          });
          created++;
          if (costPrice) {
            console.log(`🆕 Создан: ${apiProduct.name} - себестоимость: ${costPrice} ₺`);
          } else {
            console.log(`🆕 Создан: ${apiProduct.name} - без себестоимости`);
          }
        }
      } catch (error) {
        console.error(`❌ Ошибка с товаром ${apiProduct.name}:`, error.message);
      }
    }

    console.log('\n🎉 Завершено!');
    console.log(`✅ Создано товаров: ${created}`);
    console.log(`📝 Обновлено товаров: ${updated}`);
    console.log(`💰 Товаров с себестоимостью: ${productCosts.length}`);

  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
addProductCosts();
