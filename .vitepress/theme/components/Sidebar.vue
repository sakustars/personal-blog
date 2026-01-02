<script setup lang="ts">
import { Icon } from 'linar'
import { VPNavBarSearch } from 'vitepress/theme'
import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import type { SidebarGroupItem, SidebarItem, SidebarRole } from './sidebar.types'
import { anyActive, filterByRole, isGroup, isLink, isActiveLink, normalizePath } from './sidebar.utils'

type Props = {
  items: SidebarItem[]
  currentPath: string
  role: SidebarRole
  brandText?: string
  brandHref?: string
  collapsed?: boolean
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  brandText: 'Personal',
  brandHref: '/',
  collapsed: false,
  open: false
})

const emit = defineEmits<{
  (e: 'update:collapsed', value: boolean): void
  (e: 'update:open', value: boolean): void
}>()

const state = reactive({
  isMobile: false,
  groups: {} as Record<string, boolean>
})

const filteredItems = computed(() => filterByRole(props.items, props.role))

function setMobile(value: boolean) {
  state.isMobile = value
  if (!value) emit('update:open', false)
}

function readStoredCollapsed() {
  try {
    const raw = localStorage.getItem('lp:sidebar:collapsed')
    if (!raw) return
    emit('update:collapsed', raw === '1')
  } catch {}
}

function persistCollapsed(value: boolean) {
  try {
    localStorage.setItem('lp:sidebar:collapsed', value ? '1' : '0')
  } catch {}
}

function readStoredGroups() {
  try {
    const raw = localStorage.getItem('lp:sidebar:groups')
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') state.groups = parsed
  } catch {}
}

function persistGroups(groups: Record<string, boolean>) {
  try {
    localStorage.setItem('lp:sidebar:groups', JSON.stringify(groups))
  } catch {}
}

function initGroups(items: SidebarItem[]) {
  for (const item of items) {
    if (!isGroup(item)) continue
    if (state.groups[item.id] == null) {
      state.groups[item.id] = item.defaultOpen === true
    }
    initGroups(item.children)
  }
}

function ensureActiveGroups(items: SidebarItem[]) {
  for (const item of items) {
    if (!isGroup(item)) continue
    if (anyActive(item, props.currentPath)) state.groups[item.id] = true
    ensureActiveGroups(item.children)
  }
}

function toggleGroup(group: SidebarGroupItem) {
  if (isCollapsed.value) {
    emit('update:collapsed', false)
    persistCollapsed(false)
    state.groups[group.id] = true
    return
  }
  state.groups[group.id] = !state.groups[group.id]
}

function toggleCollapsed() {
  const next = !props.collapsed
  emit('update:collapsed', next)
  persistCollapsed(next)
}

function closeMobile() {
  emit('update:open', false)
}

function openMobile() {
  emit('update:open', true)
}

function onEsc(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (props.open) closeMobile()
}

function computeMobile() {
  if (typeof window === 'undefined') return
  setMobile(window.matchMedia('(max-width: 959px)').matches)
}

onMounted(() => {
  computeMobile()
  window.addEventListener('resize', computeMobile)
  window.addEventListener('keydown', onEsc)
  readStoredCollapsed()
  readStoredGroups()
  initGroups(filteredItems.value)
  ensureActiveGroups(filteredItems.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', computeMobile)
  window.removeEventListener('keydown', onEsc)
})

watch(
  () => filteredItems.value,
  (items) => {
    initGroups(items)
    ensureActiveGroups(items)
    persistGroups(state.groups)
  },
  { deep: true }
)

watch(
  () => props.currentPath,
  () => {
    ensureActiveGroups(filteredItems.value)
    persistGroups(state.groups)
  }
)

watch(
  () => state.groups,
  (g) => persistGroups(g),
  { deep: true }
)

const normalizedCurrent = computed(() => normalizePath(props.currentPath))
const isCollapsed = computed(() => !state.isMobile && props.collapsed)
const sidebarClass = computed(() => ({
  'lp-sidebar': true,
  'is-mobile': state.isMobile,
  'is-open': state.isMobile && props.open,
  'is-collapsed': isCollapsed.value
}))

function itemActive(item: SidebarItem) {
  if (isLink(item)) return isActiveLink(item, normalizedCurrent.value)
  return anyActive(item, normalizedCurrent.value)
}

function resolvedHref(href: string) {
  if (!href) return '#'
  return href
}
</script>

<template>
  <button v-if="state.isMobile" class="lp-mobile-trigger" type="button" @click="openMobile">
    <span class="lp-mobile-trigger__icon"><Icon name="menu" /></span>
  </button>

  <div v-if="state.isMobile" class="lp-backdrop" :class="{ show: open }" @click="closeMobile" />

  <aside :class="sidebarClass">
    <div class="lp-sidebar__brand">
      <a class="lp-brand" :href="resolvedHref(brandHref)">
        <span class="lp-brand__dot" />
        <span class="lp-brand__text">{{ brandText }}</span>
      </a>

      <button v-if="!state.isMobile" class="lp-collapse" type="button" @click="toggleCollapsed">
        <span class="lp-collapse__icon">
          <Icon :name="collapsed ? 'chevronRight' : 'chevronDown'" />
        </span>
      </button>

      <button v-else class="lp-close" type="button" @click="closeMobile">
        <span class="lp-close__icon"><Icon name="chevronRight" /></span>
      </button>
    </div>

    <div class="lp-sidebar__search">
      <VPNavBarSearch />
    </div>

    <nav class="lp-nav" aria-label="Sidebar">
      <template v-for="item in filteredItems" :key="item.id">
        <div v-if="item.type === 'group'" class="lp-group" :class="{ active: itemActive(item) }">
          <button
            class="lp-group__button"
            type="button"
            :disabled="item.disabled"
            @click="toggleGroup(item as SidebarGroupItem)"
          >
            <span class="lp-nav__icon" aria-hidden="true">
              <Icon v-if="item.icon" :name="item.icon" />
              <Icon v-else name="layers" />
            </span>
            <span class="lp-nav__text">{{ item.label }}</span>
            <span class="lp-group__chev" aria-hidden="true">
              <Icon :name="state.groups[item.id] ? 'chevronDown' : 'chevronRight'" />
            </span>
            <span v-if="isCollapsed" class="lp-tooltip">{{ item.label }}</span>
          </button>

          <Transition name="lp-expand">
            <div v-show="!isCollapsed && state.groups[item.id]" class="lp-group__children">
              <template v-for="child in (item as SidebarGroupItem).children" :key="child.id">
                <div v-if="child.type === 'group'" class="lp-subgroup">
                  <button
                    class="lp-group__button lp-group__button--sub"
                    type="button"
                    :disabled="child.disabled"
                    @click="toggleGroup(child as SidebarGroupItem)"
                  >
                    <span class="lp-nav__icon" aria-hidden="true">
                      <Icon v-if="child.icon" :name="child.icon" />
                      <Icon v-else name="layers" />
                    </span>
                    <span class="lp-nav__text">{{ child.label }}</span>
                    <span class="lp-group__chev" aria-hidden="true">
                      <Icon :name="state.groups[child.id] ? 'chevronDown' : 'chevronRight'" />
                    </span>
                    <span v-if="isCollapsed" class="lp-tooltip">{{ child.label }}</span>
                  </button>

                  <Transition name="lp-expand">
                    <div v-show="!isCollapsed && state.groups[child.id]" class="lp-group__children lp-group__children--sub">
                      <a
                        v-for="leaf in (child as SidebarGroupItem).children"
                        :key="leaf.id"
                        class="lp-nav__item lp-nav__item--leaf"
                        :class="{ active: itemActive(leaf) }"
                        :aria-current="itemActive(leaf) ? 'page' : undefined"
                        :href="leaf.type === 'link' ? resolvedHref(leaf.href) : '#'"
                        :data-disabled="leaf.disabled ? '1' : undefined"
                      >
                        <span class="lp-nav__icon" aria-hidden="true">
                          <Icon v-if="leaf.icon" :name="leaf.icon" />
                          <Icon v-else name="book" />
                        </span>
                        <span class="lp-nav__text">{{ leaf.label }}</span>
                        <span v-if="isCollapsed" class="lp-tooltip">{{ leaf.label }}</span>
                      </a>
                    </div>
                  </Transition>
                </div>

                <a
                  v-else
                  class="lp-nav__item"
                  :class="{ active: itemActive(child) }"
                  :aria-current="itemActive(child) ? 'page' : undefined"
                  :href="resolvedHref((child as any).href)"
                  :data-disabled="child.disabled ? '1' : undefined"
                >
                  <span class="lp-nav__icon" aria-hidden="true">
                    <Icon v-if="child.icon" :name="child.icon" />
                    <Icon v-else name="book" />
                  </span>
                  <span class="lp-nav__text">{{ child.label }}</span>
                  <span v-if="isCollapsed" class="lp-tooltip">{{ child.label }}</span>
                </a>
              </template>
            </div>
          </Transition>
        </div>

        <a
          v-else
          class="lp-nav__item"
          :class="{ active: itemActive(item) }"
          :aria-current="itemActive(item) ? 'page' : undefined"
          :href="resolvedHref((item as any).href)"
          :data-disabled="item.disabled ? '1' : undefined"
        >
          <span class="lp-nav__icon" aria-hidden="true">
            <Icon v-if="item.icon" :name="item.icon" />
            <Icon v-else name="book" />
          </span>
          <span class="lp-nav__text">{{ item.label }}</span>
          <span v-if="isCollapsed" class="lp-tooltip">{{ item.label }}</span>
        </a>
      </template>
    </nav>

    <div class="lp-sidebar__footer">
      <slot name="footer" />
    </div>
  </aside>
</template>
