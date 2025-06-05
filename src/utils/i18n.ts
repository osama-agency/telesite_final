// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { ensurePrefix } from '@/utils/string'

// Check if the url is missing the locale
export const isUrlMissingLocale = (url: string) => {
  return i18n.locales.every(locale => !(url.startsWith(`/${locale}/`) || url === `/${locale}`))
}

// Get the localized url
export const getLocalizedUrl = (url: string, languageCode: string): string => {
  if (!url || !languageCode) throw new Error("URL or Language Code can't be empty")

  return isUrlMissingLocale(url) ? `/${languageCode}${ensurePrefix(url, '/')}` : url
}

// Declension of numerals in Russian
export const declOfNum = (number: number, words: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2]
  const index = number % 100 > 4 && number % 100 < 20 ? 2 : cases[Math.min(number % 10, 5)]

  return words[index]
}
