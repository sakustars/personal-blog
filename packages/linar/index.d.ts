import type { DefineComponent } from 'vue'

export type IconName =
  | 'home'
  | 'book'
  | 'user'
  | 'moon'
  | 'sun'
  | 'chevronDown'
  | 'chevronRight'
  | 'menu'
  | 'layers'
  | (string & {})

export const Icon: DefineComponent<{
  name: IconName
  size?: number
  title?: string
  class?: string
}>

