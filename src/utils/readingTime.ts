export function getReadingTime(text: string, lang: "zh" | "en") {
  const plainText = text
    .replace(/^---[\s\S]*?---/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~\[\]()!-]/g, " ");

  const chineseCharacters = plainText.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  const latinWords = plainText
    .replace(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g, " ")
    .match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;
  const minutes = Math.max(1, Math.ceil(chineseCharacters / 300 + latinWords / 220));

  return lang === "zh" ? `约 ${minutes} 分钟` : `${minutes} min read`;
}

