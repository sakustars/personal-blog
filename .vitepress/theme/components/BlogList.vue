<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'

type Post = {
  title: string
  date?: string
  displayDate?: string
  description?: string
  tags?: string[]
  url: string
}

type GlobModule = {
  __pageData?: {
    frontmatter?: Record<string, unknown>
  }
}

const modules = import.meta.glob<GlobModule>('../../../blog/**/*.md', { eager: true })

function toUrlFromGlobPath(globPath: string) {
  const normalized = globPath.replace(/\\/g, '/')
  const blogIndex = normalized.lastIndexOf('/blog/')
  if (blogIndex === -1) return '/'
  const route = normalized.slice(blogIndex).replace(/\.md$/, '')
  return route
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

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(
      new Date(date)
    )
  } catch {
    return date
  }
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
      const description = typeof frontmatter.description === 'string' ? frontmatter.description : undefined
      const tags = Array.isArray(frontmatter.tags)
        ? frontmatter.tags.filter((t) => typeof t === 'string')
        : undefined

      return {
        title,
        date,
        displayDate: date ? formatDate(date) : undefined,
        description,
        tags,
        url
      } satisfies Post
    })
    .filter((x): x is Post => Boolean(x))

  entries.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  })

  return entries
})
</script>

<template>
  <div class="lp-posts">
    <a v-for="post in posts" :key="post.url" class="lp-card" :href="withBase(post.url)">
      <div class="lp-card__top">
        <div class="lp-title">{{ post.title }}</div>
        <div v-if="post.displayDate" class="lp-date">{{ post.displayDate }}</div>
      </div>
      <div v-if="post.description" class="lp-desc">
        {{ post.description }}
      </div>
      <div v-if="post.tags?.length" class="lp-tags">
        <span v-for="t in post.tags" :key="t" class="lp-tag">{{ t }}</span>
      </div>
    </a>
  </div>
</template>
