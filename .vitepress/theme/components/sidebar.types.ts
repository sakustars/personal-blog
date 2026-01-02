export type SidebarRole = 'guest' | 'member' | 'admin' | (string & {})

export type SidebarItem = SidebarLinkItem | SidebarGroupItem

export type SidebarBaseItem = {
  id: string
  label: string
  icon?: string
  roles?: SidebarRole[]
  disabled?: boolean
}

export type SidebarLinkItem = SidebarBaseItem & {
  type: 'link'
  href: string
  exact?: boolean
}

export type SidebarGroupItem = SidebarBaseItem & {
  type: 'group'
  defaultOpen?: boolean
  children: SidebarItem[]
}

