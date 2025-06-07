'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Config Imports
import { i18n } from '@configs/i18n'

const LangRedirect = () => {
  const pathname = usePathname()

  useEffect(() => {
    const redirectUrl = `/${i18n.defaultLocale}${pathname}`

    redirect(redirectUrl)
  }, [pathname])

  return null
}

export default LangRedirect
