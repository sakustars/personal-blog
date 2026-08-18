import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://blog.carleight.com/",
    title: "CARLEIGHT",
    description: "关于科学、技术、阅读与日常生活的个人写作。",
    author: "Carleight",
    profile: "https://blog.carleight.com/",
    ogImage: "default-og.jpg",
    lang: "zh-CN",
    timezone: "Asia/Singapore",
    dir: "ltr",
  },
  posts: {
    perPage: 12,
    perIndex: 12,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: false,
    dynamicOgImage: false,
    showArchives: false,
    showBackButton: true,
    editPost: { enabled: false },
    search: false,
  },
  socials: [],
  shareLinks: [],
});
