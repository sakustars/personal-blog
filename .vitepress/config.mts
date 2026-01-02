import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '个人网站',
  description: '博客与作品集',
  cleanUrls: true,
  appearance: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/blog/' },
      { text: '关于', link: '/about' }
    ],
    outline: [2, 3],
    search: {
      provider: 'local',
      options: {
        locales: {
          'zh-CN': {
            translations: {
              button: {
                buttonText: 'Guidance',
                buttonAriaLabel: 'Search'
              }
            }
          }
        }
      }
    }
  },
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
