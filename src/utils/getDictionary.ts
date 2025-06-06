// Third-party Imports
import 'server-only'

// Type Imports
import type { Locale } from '@configs/i18n'

const dictionaries = {
  ru: () => import('@/data/dictionaries/ru.json').then(module => module.default),
  tr: () => import('@/data/dictionaries/tr.json').then(module => module.default)
}

export const getDictionary = async (locale: Locale) => {
  const dictionary = dictionaries[locale]

  if (!dictionary) {
    // Fallback to default locale if requested locale is not available
    return dictionaries['ru']()
  }

  return dictionary()
}
