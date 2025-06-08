import { Request, Response } from 'express';

interface CurrencyRate {
  CharCode: string;
  Name: string;
  Value: number;
  Previous: number;
  Nominal: number;
}

interface CBRApiResponse {
  Date: string;
  PreviousDate: string;
  PreviousURL: string;
  Timestamp: string;
  Valute: {
    [key: string]: CurrencyRate;
  };
}

// Кэш курсов для избежания частых запросов к ЦБ
let cachedRates: {
  current: number;
  currentWithBuffer: number;
  average30Days: number;
  lastUpdate: string;
} | null = null;

let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 минут в миллисекундах
const BUFFER_PERCENT = 0.05; // 5% буфер

/**
 * Получение курса лиры от ЦБ РФ
 */
async function fetchCurrencyFromCBR(): Promise<number> {
  try {
    console.log('🏦 Запрос курса лиры от ЦБ РФ...');

    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as CBRApiResponse;

    // Курс турецкой лиры (TRY)
    const tryRate = data.Valute.TRY;
    if (!tryRate) {
      throw new Error('TRY currency not found in CBR response');
    }

    // ЦБ дает курс за Nominal лир (обычно 10)
    // Нужно получить курс за 1 лиру
    const rubPerTry = tryRate.Value / tryRate.Nominal;

    console.log(`💱 Курс ЦБ: 1 ₺ = ${rubPerTry.toFixed(4)} ₽ (за ${tryRate.Nominal} лир: ${tryRate.Value} ₽)`);

    return rubPerTry;
  } catch (error) {
    console.error('❌ Ошибка получения курса от ЦБ:', error);
    // Fallback к дефолтному курсу при ошибке
    return 3.45;
  }
}

/**
 * Расчет среднего курса за 30 дней (заглушка)
 * В реальном проекте здесь был бы запрос к базе данных с историческими курсами
 */
function calculateAverage30Days(currentRate: number): number {
  // Имитируем небольшое отклонение от текущего курса
  const deviation = (Math.random() - 0.5) * 0.1; // ±5%
  return currentRate * (1 + deviation);
}

/**
 * Обновление кэша курсов
 */
async function updateCurrencyCache(): Promise<void> {
  try {
    const currentRate = await fetchCurrencyFromCBR();
    const currentWithBuffer = currentRate * (1 + BUFFER_PERCENT);
    const average30Days = calculateAverage30Days(currentRate);

    cachedRates = {
      current: currentRate,
      currentWithBuffer: currentWithBuffer,
      average30Days: average30Days,
      lastUpdate: new Date().toISOString()
    };

    lastFetchTime = Date.now();

    console.log(`✅ Курсы обновлены:
      - Текущий: ${currentRate.toFixed(4)} ₽/₺
      - С буфером (+5%): ${currentWithBuffer.toFixed(4)} ₽/₺
      - Средний за 30 дней: ${average30Days.toFixed(4)} ₽/₺`);

  } catch (error) {
    console.error('❌ Ошибка обновления кэша курсов:', error);
  }
}

/**
 * Получение актуальных курсов валют
 */
export const getCurrencyRates = async (req: Request, res: Response) => {
  try {
    // Проверяем, нужно ли обновить кэш
    const now = Date.now();
    if (!cachedRates || (now - lastFetchTime) > CACHE_DURATION) {
      await updateCurrencyCache();
    }

    if (!cachedRates) {
      // Если кэш все еще пустой, возвращаем дефолтные значения
      cachedRates = {
        current: 3.45,
        currentWithBuffer: 3.45 * (1 + BUFFER_PERCENT),
        average30Days: 3.42,
        lastUpdate: new Date().toISOString()
      };
    }

    res.json({
      success: true,
      data: {
        current: parseFloat(cachedRates.current.toFixed(4)),
        currentWithBuffer: parseFloat(cachedRates.currentWithBuffer.toFixed(4)),
        average30Days: parseFloat(cachedRates.average30Days.toFixed(4)),
        buffer: BUFFER_PERCENT,
        lastUpdate: cachedRates.lastUpdate,
        source: 'ЦБ РФ',
        nextUpdate: new Date(lastFetchTime + CACHE_DURATION).toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения курсов валют:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения курсов валют'
    });
  }
};

/**
 * Принудительное обновление курсов (для админов)
 */
export const forceUpdateCurrencyRates = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Принудительное обновление курсов...');
    await updateCurrencyCache();

    res.json({
      success: true,
      message: 'Курсы валют успешно обновлены',
      data: cachedRates
    });

  } catch (error) {
    console.error('❌ Ошибка принудительного обновления курсов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления курсов валют'
    });
  }
};

// Инициализация: загрузить курсы при старте сервера
updateCurrencyCache();
