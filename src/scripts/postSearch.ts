export function setupPostSearch(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-post-search]").forEach(scope => {
    if (scope.dataset.searchReady === "true") return;

    const input = scope.querySelector<HTMLInputElement>("[data-search-input]");
    const rows = [...scope.querySelectorAll<HTMLElement>("[data-search-row]")];
    const empty = scope.querySelector<HTMLElement>("[data-search-empty]");
    const status = scope.querySelector<HTMLElement>("[data-search-status]");
    const count = status?.querySelector<HTMLElement>("[data-search-count]");
    const countLabel = status?.querySelector<HTMLElement>("[data-count-label]");
    if (!input || !rows.length || !empty || !status || !count || !countLabel)
      return;

    const locale = document.documentElement.lang;
    const normalize = (value: string) =>
      value
        .normalize("NFKC")
        .toLocaleLowerCase(locale)
        .replace(/\s+/g, " ")
        .trim();
    const searchableRows = rows.map(row => ({
      row,
      text: normalize(row.dataset.search ?? ""),
    }));

    const render = (matches: Set<HTMLElement>) => {
      rows.forEach(row => {
        row.hidden = !matches.has(row);
      });
      count.textContent = String(matches.size);
      countLabel.textContent =
        matches.size === 1
          ? (status.dataset.singular ?? "")
          : (status.dataset.plural ?? "");
      empty.hidden = matches.size !== 0;
    };

    input.addEventListener("input", () => {
      const query = normalize(input.value);
      if (!query) return render(new Set(rows));

      const terms = query.split(" ");
      render(
        new Set(
          searchableRows
            .filter(({ text }) => terms.every(term => text.includes(term)))
            .map(({ row }) => row)
        )
      );
    });
    scope.dataset.searchReady = "true";
  });
}
