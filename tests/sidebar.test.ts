import { mount } from '@vue/test-utils'
import type { DOMWrapper } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Sidebar from '../.vitepress/theme/components/Sidebar.vue'
import type { SidebarItem } from '../.vitepress/theme/components/sidebar.types'

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })
}

describe('Sidebar', () => {
  it('filters items by role', async () => {
    mockMatchMedia(false)
    const items: SidebarItem[] = [
      { id: 'a', type: 'link', label: 'A', href: '/a', icon: 'home' },
      {
        id: 'admin',
        type: 'group',
        label: 'Admin',
        roles: ['admin'],
        children: [{ id: 'b', type: 'link', label: 'B', href: '/b', icon: 'book' }]
      }
    ]

    const wrapper = mount(Sidebar, {
      props: {
        items,
        currentPath: '/a',
        role: 'guest'
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('A')
    expect(wrapper.text()).not.toContain('Admin')
    expect(wrapper.text()).not.toContain('B')
  })

  it('marks active link based on currentPath', async () => {
    mockMatchMedia(false)
    const items: SidebarItem[] = [
      { id: 'a', type: 'link', label: 'A', href: '/a', icon: 'home' },
      { id: 'ax', type: 'link', label: 'AX', href: '/a/x', icon: 'home', exact: true },
      { id: 'b', type: 'link', label: 'B', href: '/b', icon: 'book' }
    ]

    const wrapper = mount(Sidebar, {
      props: {
        items,
        currentPath: '/a/x',
        role: 'guest'
      }
    })

    await wrapper.vm.$nextTick()
    const links = wrapper.findAll('a.lp-nav__item')
    const a = links.find((n: DOMWrapper<Element>) => n.text().includes('A'))
    const ax = links.find((n: DOMWrapper<Element>) => n.text().includes('AX'))
    const b = links.find((n: DOMWrapper<Element>) => n.text().includes('B'))

    expect(a?.classes()).toContain('active')
    expect(ax?.classes()).toContain('active')
    expect(b?.classes()).not.toContain('active')
  })

  it('toggles group expand/collapse', async () => {
    mockMatchMedia(false)
    const items: SidebarItem[] = [
      {
        id: 'g',
        type: 'group',
        label: 'Group',
        defaultOpen: false,
        children: [{ id: 'c', type: 'link', label: 'Child', href: '/c', icon: 'book' }]
      }
    ]

    const wrapper = mount(Sidebar, {
      props: {
        items,
        currentPath: '/',
        role: 'guest'
      }
    })

    await wrapper.vm.$nextTick()
    const child = wrapper.findAll('a.lp-nav__item').find((n: DOMWrapper<Element>) => n.text().includes('Child'))
    expect(child?.exists()).toBe(true)

    const children = wrapper.find('.lp-group__children')
    expect(children.exists()).toBe(true)
    expect((children.element as HTMLElement).style.display).toBe('none')

    await wrapper.find('button.lp-group__button').trigger('click')
    await wrapper.vm.$nextTick()
    expect((children.element as HTMLElement).style.display).toBe('')
  })

  it('renders tooltip when collapsed on desktop', async () => {
    mockMatchMedia(false)
    const items: SidebarItem[] = [{ id: 'a', type: 'link', label: 'A', href: '/a', icon: 'home' }]

    const wrapper = mount(Sidebar, {
      props: {
        items,
        currentPath: '/a',
        role: 'guest',
        collapsed: true
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.lp-sidebar.is-collapsed').exists()).toBe(true)
    expect(wrapper.find('.lp-tooltip').exists()).toBe(true)
  })

  it('opens as drawer on mobile', async () => {
    mockMatchMedia(true)
    const items: SidebarItem[] = [{ id: 'a', type: 'link', label: 'A', href: '/a', icon: 'home' }]

    const wrapper = mount(Sidebar, {
      props: {
        items,
        currentPath: '/a',
        role: 'guest',
        open: true
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.lp-sidebar.is-mobile').exists()).toBe(true)
    expect(wrapper.find('.lp-sidebar.is-open').exists()).toBe(true)
  })
})
