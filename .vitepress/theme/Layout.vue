<script setup lang="ts">
import { useData, useRoute, withBase } from 'vitepress'
import { computed, onBeforeUnmount, onMounted, provide, ref, useSlots } from 'vue'
import { Icon } from 'linar'
import VPContent from 'vitepress/dist/client/theme-default/components/VPContent.vue'
import VPFooter from 'vitepress/dist/client/theme-default/components/VPFooter.vue'
import VPSkipLink from 'vitepress/dist/client/theme-default/components/VPSkipLink.vue'
import Sidebar from './components/Sidebar.vue'
import type { SidebarItem, SidebarRole } from './components/sidebar.types'

type Post = {
  title: string
  date?: string
  url: string
}

type GlobModule = {
  __pageData?: {
    frontmatter?: Record<string, unknown>
  }
}

const { isDark, frontmatter } = useData()
const route = useRoute()
const slots = useSlots()
const heroImageSlotExists = computed(() => Boolean(slots['home-hero-image']))

provide('hero-image-slot-exists', heroImageSlotExists)

const modules = import.meta.glob<GlobModule>('../../blog/**/*.md', { eager: true })

function normalizePath(p: string) {
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1)
  return p
}

function toUrlFromGlobPath(globPath: string) {
  const normalized = globPath.replace(/\\/g, '/')
  const blogIndex = normalized.lastIndexOf('/blog/')
  if (blogIndex === -1) return '/'
  const routePath = normalized.slice(blogIndex).replace(/\.md$/, '')
  return routePath
}

function toFrontmatter(module: GlobModule) {
  return (module.__pageData?.frontmatter ?? {}) as Record<string, unknown>
}

function toIsoDate(date: unknown) {
  if (typeof date !== 'string') return undefined
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

const posts = computed<Post[]>(() => {
  const entries = Object.entries(modules)
    .filter(([p]) => !p.endsWith('/blog/index.md'))
    .map(([p, m]) => {
      const frontmatter = toFrontmatter(m)
      if (frontmatter.draft === true) return null
      const title = frontmatter.title
      if (typeof title !== 'string' || !title.trim()) return null

      const url = toUrlFromGlobPath(p)
      const date = toIsoDate(frontmatter.date)
      return { title, date, url } satisfies Post
    })
    .filter((x): x is Post => Boolean(x))

  entries.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  })

  return entries
})

const currentPath = computed(() => normalizePath(route.path))
const isBlogPost = computed(() => {
  const p = currentPath.value
  return p.startsWith('/blog/') && p !== '/blog'
})

const postIndex = computed(() => posts.value.findIndex((p) => normalizePath(p.url) === currentPath.value))
const prevPost = computed(() => {
  const i = postIndex.value
  if (i <= 0) return null
  return posts.value[i - 1] ?? null
})
const nextPost = computed(() => {
  const i = postIndex.value
  if (i === -1) return null
  return posts.value[i + 1] ?? null
})

const recentPosts = computed(() => posts.value.slice(0, 8))

const sidebarCollapsed = ref(false)
const sidebarOpen = ref(false)
const userRole = ref<SidebarRole>('guest')

const sidebarItems = computed<SidebarItem[]>(() => {
  const postItems: SidebarItem[] = recentPosts.value.map((p) => ({
    id: `post:${p.url}`,
    type: 'link',
    label: p.title,
    href: withBase(p.url),
    icon: 'book',
    exact: true
  }))

  return [
    { id: 'home', type: 'link', label: '首页', href: withBase('/'), icon: 'home', exact: true },
    { id: 'blog', type: 'link', label: '博客', href: withBase('/blog/'), icon: 'book' },
    { id: 'about', type: 'link', label: '关于', href: withBase('/about'), icon: 'user', exact: true },
    {
      id: 'workspace',
      type: 'group',
      label: 'Workspace',
      icon: 'layers',
      defaultOpen: true,
      children: [
        {
          id: 'content',
          type: 'group',
          label: '内容',
          icon: 'layers',
          defaultOpen: true,
          children: [
            { id: 'content:blog', type: 'link', label: '全部文章', href: withBase('/blog/'), icon: 'book' },
            ...postItems
          ]
        },
        {
          id: 'admin',
          type: 'group',
          label: '管理',
          icon: 'layers',
          roles: ['admin'],
          children: [{ id: 'admin:drafts', type: 'link', label: '草稿', href: withBase('/blog/'), icon: 'book' }]
        }
      ]
    }
  ]
})

function toggleDark() {
  isDark.value = !isDark.value
}

function navigateToPost(url: string) {
  window.location.href = withBase(url)
}

function onKeydown(e: KeyboardEvent) {
  if (!isBlogPost.value) return
  if (!e.altKey) return
  if (e.key === 'ArrowLeft' && prevPost.value) {
    e.preventDefault()
    navigateToPost(prevPost.value.url)
  }
  if (e.key === 'ArrowRight' && nextPost.value) {
    e.preventDefault()
    navigateToPost(nextPost.value.url)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div
    class="lp-shell"
    :style="{
      '--lp-sidebar-current-w': sidebarCollapsed ? '56px' : '232px'
    }"
  >
    <Sidebar
      v-model:collapsed="sidebarCollapsed"
      v-model:open="sidebarOpen"
      :items="sidebarItems"
      :current-path="currentPath"
      :role="userRole"
      brand-text="Personal"
      :brand-href="withBase('/')"
    />

    <button class="lp-theme-button" :class="{ 'is-collapsed': sidebarCollapsed }" type="button" @click="toggleDark">
      <span class="lp-theme-button__icon" aria-hidden="true">
        <Icon :name="isDark ? 'moon' : 'sun'" />
      </span>
      <span class="lp-theme-button__label">{{ isDark ? 'Dark' : 'Light' }}</span>
    </button>

    <div class="lp-main">
      <div v-if="frontmatter.layout !== false" class="Layout" :class="frontmatter.pageClass">
        <slot name="layout-top" />
        <VPSkipLink />
        <VPContent>
          <template #page-top><slot name="page-top" /></template>
          <template #page-bottom><slot name="page-bottom" /></template>
          <template #not-found><slot name="not-found" /></template>
          <template #home-hero-before><slot name="home-hero-before" /></template>
          <template #home-hero-info-before><slot name="home-hero-info-before" /></template>
          <template #home-hero-info><slot name="home-hero-info" /></template>
          <template #home-hero-info-after><slot name="home-hero-info-after" /></template>
          <template #home-hero-actions-after><slot name="home-hero-actions-after" /></template>
          <template #home-hero-image><slot name="home-hero-image" /></template>
          <template #home-hero-after><slot name="home-hero-after" /></template>
          <template #home-features-before><slot name="home-features-before" /></template>
          <template #home-features-after><slot name="home-features-after" /></template>
          <template #doc-footer-before><slot name="doc-footer-before" /></template>
          <template #doc-before><slot name="doc-before" /></template>
          <template #doc-after>
            <slot name="doc-after" />
            <div v-if="isBlogPost && (prevPost || nextPost)" class="lp-post-nav">
              <a v-if="prevPost" class="lp-post-nav__item lp-post-nav__item--prev" :href="withBase(prevPost.url)">
                <span class="lp-post-nav__label">
                  <span class="lp-post-nav__arrow" aria-hidden="true">←</span>
                  上一篇
                </span>
                <span class="lp-post-nav__title">{{ prevPost.title }}</span>
              </a>
              <a v-if="nextPost" class="lp-post-nav__item lp-post-nav__item--next" :href="withBase(nextPost.url)">
                <span class="lp-post-nav__label">
                  下一篇
                  <span class="lp-post-nav__arrow" aria-hidden="true">→</span>
                </span>
                <span class="lp-post-nav__title">{{ nextPost.title }}</span>
              </a>
            </div>
          </template>
          <template #doc-top><slot name="doc-top" /></template>
          <template #doc-bottom><slot name="doc-bottom" /></template>
          <template #aside-top>
            <slot name="aside-top" />
            <div v-if="isBlogPost && (prevPost || nextPost)" class="lp-aside-switch">
              <div class="lp-aside-switch__title">快捷切换</div>
              <div class="lp-aside-switch__links">
                <a v-if="prevPost" class="lp-aside-switch__link" :href="withBase(prevPost.url)">
                  <span class="lp-aside-switch__label">上一篇</span>
                  <span class="lp-aside-switch__text">{{ prevPost.title }}</span>
                </a>
                <a v-if="nextPost" class="lp-aside-switch__link" :href="withBase(nextPost.url)">
                  <span class="lp-aside-switch__label">下一篇</span>
                  <span class="lp-aside-switch__text">{{ nextPost.title }}</span>
                </a>
              </div>
            </div>
          </template>
          <template #aside-bottom><slot name="aside-bottom" /></template>
          <template #aside-outline-before><slot name="aside-outline-before" /></template>
          <template #aside-outline-after><slot name="aside-outline-after" /></template>
          <template #aside-ads-before><slot name="aside-ads-before" /></template>
          <template #aside-ads-after><slot name="aside-ads-after" /></template>
        </VPContent>
        <VPFooter />
        <slot name="layout-bottom" />
      </div>
      <Content v-else />
    </div>
  </div>
</template>
