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

export const useDateRangeStore = create<DateRangeState>((set, get) => ({
  range: { start: null, end: null },
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
