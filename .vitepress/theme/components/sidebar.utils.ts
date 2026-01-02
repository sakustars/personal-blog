import type { SidebarGroupItem, SidebarItem, SidebarLinkItem, SidebarRole } from './sidebar.types'

export function normalizePath(p: string) {
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1)
  return p
}

export function hasRole(item: { roles?: SidebarRole[] }, role: SidebarRole) {
  if (!item.roles || item.roles.length === 0) return true
  return item.roles.includes(role)
}

export function isGroup(item: SidebarItem): item is SidebarGroupItem {
  return item.type === 'group'
}

export function isLink(item: SidebarItem): item is SidebarLinkItem {
  return item.type === 'link'
}

export function isActiveLink(link: SidebarLinkItem, currentPath: string) {
  const current = normalizePath(currentPath)
  const target = normalizePath(link.href)

  if (link.exact) return current === target
  if (target === '/') return current === '/'
  return current === target || current.startsWith(`${target}/`)
}

export function anyActive(item: SidebarItem, currentPath: string): boolean {
  if (isLink(item)) return isActiveLink(item, currentPath)
  return item.children.some((c) => anyActive(c, currentPath))
}

export function filterByRole(items: SidebarItem[], role: SidebarRole): SidebarItem[] {
  const out: SidebarItem[] = []

  for (const item of items) {
    if (!hasRole(item, role)) continue

    if (isGroup(item)) {
      const children = filterByRole(item.children, role)
      if (children.length === 0) continue
      out.push({ ...item, children })
    } else {
      out.push(item)
    }
  }

  return out
}

