export const i18n = {
  defaultLocale: 'ru',
  locales: ['ru', 'tr'],
  langDirection: {
    ru: 'ltr',
    tr: 'ltr'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
