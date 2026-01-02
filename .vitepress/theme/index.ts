import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import BlogList from './components/BlogList.vue'
import Layout from './Layout.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout),
  enhanceApp(ctx) {
    ctx.app.component('BlogList', BlogList)
  }
} satisfies Theme
