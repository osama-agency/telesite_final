import { create } from 'zustand'

export type DateRange = {
  start: Date | null
  end: Date | null
}

interface DateRangeState {
  range: DateRange
  setRange: (range: DateRange) => void
  listeners: (() => void)[]
  subscribe: (listener: () => void) => () => void
}

// Функция для получения периода "последние 30 дней" по умолчанию
const getDefaultDateRange = (): DateRange => {
  // Проверяем, что мы на клиенте, чтобы избежать hydration mismatch
  if (typeof window === 'undefined') {
    return { start: null, end: null }
  }

  const end = new Date()
  const start = new Date()

  start.setDate(end.getDate() - 29) // 30 дней включая сегодня

  return { start, end }
}

export const useDateRangeStore = create<DateRangeState>((set, get) => ({
  range: getDefaultDateRange(), // Устанавливаем "последние 30 дней" по умолчанию
  setRange: (range) => {
    set({ range })
    get().listeners.forEach(fn => fn())
  },
  listeners: [],
  subscribe: (listener) => {
    get().listeners.push(listener)

    return () => {
      const idx = get().listeners.indexOf(listener)

      if (idx > -1) get().listeners.splice(idx, 1)
    }
  }
}))
