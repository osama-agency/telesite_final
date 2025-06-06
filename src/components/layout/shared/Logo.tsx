'use client'

// React Imports
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

// Third-party Imports
import styled from '@emotion/styled'
import { motion } from 'framer-motion'

// Type Imports
import type { VerticalNavContextProps } from '@menu/contexts/verticalNavContext'

// Component Imports
import AnimatedLogo from './AnimatedLogo'

// Config Imports
import themeConfig from '@configs/themeConfig'
import { montserrat } from '@core/theme'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

type LogoTextProps = {
  isHovered?: VerticalNavContextProps['isHovered']
  isCollapsed?: VerticalNavContextProps['isCollapsed']
  transitionDuration?: VerticalNavContextProps['transitionDuration']
  isBreakpointReached?: VerticalNavContextProps['isBreakpointReached']
  color?: CSSProperties['color']
}

const LogoText = styled(motion.span)<LogoTextProps>`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-family: ${montserrat.style.fontFamily};
  font-size: 1.75rem;
  line-height: 1;
  font-weight: 800;
  font-style: italic;
  letter-spacing: 0.15px;
  margin-inline-start: 8px;
`

const Logo = ({ color }: { color?: CSSProperties['color'] }) => {
  // Refs
  const logoTextRef = useRef<HTMLSpanElement>(null)

  // Hooks
  const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()

  // Vars
  const { layout } = settings
  const isCollapsed = layout === 'collapsed'

  // Варианты анимации для логотипа (иконки)
  const logoVariants = {
    collapsed: {
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    expanded: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  }

  // Варианты анимации для текста с задержкой
  const textVariants = {
    collapsed: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    },
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.25,
        ease: 'easeOut',
        delay: 0.2  // Появляется через 200ms после начала раскрытия сайдбара
      }
    }
  }

  const shouldAnimate = isCollapsed && !isBreakpointReached
  const currentVariant = shouldAnimate ? (isHovered ? 'expanded' : 'collapsed') : 'expanded'

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoTextRef && logoTextRef.current) {
      if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
        logoTextRef.current?.classList.add('hidden')
      } else {
        logoTextRef.current.classList.remove('hidden')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, layout, isBreakpointReached])

  return (
    <div className='flex items-center'>
      <motion.div
        variants={logoVariants}
        initial={currentVariant}
        animate={currentVariant}
      >
        <AnimatedLogo
          className='w-8 h-8'
          isCollapsed={isCollapsed}
          isHovered={isHovered}
        />
      </motion.div>
      <LogoText
        color={color}
        ref={logoTextRef}
        variants={textVariants}
        initial={currentVariant}
        animate={currentVariant}
        isHovered={isHovered}
        isCollapsed={layout === 'collapsed'}
        transitionDuration={transitionDuration}
        isBreakpointReached={isBreakpointReached}
      >
        {themeConfig.templateName}
      </LogoText>
    </div>
  )
}

export default Logo
