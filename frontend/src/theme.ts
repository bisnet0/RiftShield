import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  semanticTokens: {
    colors: {
      appBg: { default: '#f5f5f0', _dark: '#0d0d0d' },
      appText: { default: '#1a1a1a', _dark: '#f5f5f0' },
      brand: { default: '#e65c00', _dark: '#e6b800' },
      brandHover: { default: '#cc5200', _dark: '#cca300' },
      brandMuted: { default: 'rgba(230, 92, 0, 0.15)', _dark: 'rgba(230, 184, 0, 0.15)' },
    },
  },
})

export default theme
