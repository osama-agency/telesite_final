import { create } from 'zustand'

export interface OrdersFilter {
  status: string
  customer: string
}

interface OrdersFilterStore {
  filters: OrdersFilter
  setFilters: (filters: OrdersFilter) => void
  setFilter: (key: keyof OrdersFilter, value: string) => void
  resetFilters: () => void
}

const defaultFilters: OrdersFilter = {
  status: 'all',
  customer: ''
}

export const useOrdersFilterStore = create<OrdersFilterStore>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) => set({ filters }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    })),
  resetFilters: () => set({ filters: defaultFilters })
}))
