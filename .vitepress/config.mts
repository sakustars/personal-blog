import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Newsroom",
  description: "Apple Newsroom Style Blog",
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    ['script', { src: 'https://identity.netlify.com/v1/netlify-identity-widget.js' }]
  ],
  themeConfig: {
    siteTitle: 'Newsroom', 
    logo: '/theme/logo.svg',
    
    nav: [
      { text: 'Press Releases', link: '/' },
      { text: 'Feature Stories', link: '/blog/graphic-design-history' },
      { text: 'Archive', link: '/blog/markdown-examples' },
      { text: 'Admin', link: '/admin/' }
    ],

    sidebar: {
      '/blog/': [
        {
          text: '2026',
          items: [
            { text: 'Graphic Design History', link: '/blog/graphic-design-history' },
            { text: 'Apple Vision Pro Updates', link: '/blog/api-examples' }
          ]
        },
        {
          text: 'Archive',
          items: [
            { text: 'Markdown Examples', link: '/blog/markdown-examples' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    footer: {
      message: 'Copyright © 2026 Apple Inc. All rights reserved.',
      copyright: 'Privacy Policy | Terms of Use | Sales and Refunds | Legal | Site Map'
    }
  }
})
