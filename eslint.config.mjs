import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'supabase/**'],
  },
  js.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
]

