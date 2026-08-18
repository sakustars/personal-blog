export const categories = [
  {
    slug: "essays",
    sourceCategories: ["Cognition"],
    zh: { label: "随笔", title: "Essays", description: "关于工作、城市与日常经验。写下那些仍在形成中的观察。" },
    en: { label: "Essays", title: "Essays", description: "Notes on work, cities, and everyday experience—observations that are still taking shape." },
  },
  {
    slug: "science",
    sourceCategories: ["Systems", "Methods"],
    zh: { label: "科学", title: "Science", description: "理解研究，也理解证据的边界。这里收集关于大脑、生命与科学方法的文章。" },
    en: { label: "Science", title: "Science", description: "Understanding research also means understanding the limits of evidence. Writing on the brain, life, and scientific methods." },
  },
  {
    slug: "technology",
    sourceCategories: ["Technology"],
    zh: { label: "技术", title: "Technology", description: "工具、软件与数字生活，以及它们如何改变我们工作和思考的方式。" },
    en: { label: "Technology", title: "Technology", description: "Tools, software, and digital life—and how they change the ways we work and think." },
  },
  {
    slug: "reading",
    sourceCategories: ["Reading"],
    zh: { label: "阅读", title: "Reading", description: "书、论文和值得留下的句子。阅读之后，继续发生的思考。" },
    en: { label: "Reading", title: "Reading", description: "Books, papers, and sentences worth keeping—the thinking that continues after reading." },
  },
] as const;

export type Category = (typeof categories)[number];

