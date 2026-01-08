# Notion Lite

A lightweight, block-based note-taking application inspired by Notion. Built with Vue 3, Tiptap, and Tailwind CSS.

## Features

- **Block-based Editor**: Rich text editing, headings, lists, tables, tasks, and images.
- **Offline First**: All data is stored locally in your browser using IndexedDB (via LocalForage).
- **Document Management**: Create, delete, and organize your documents in a sidebar.
- **Dark Mode**: Automatically adapts to your system preference or toggle manually.
- **Responsive Design**: Works on desktop and mobile.

## Tech Stack

- **Framework**: Vue 3 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Editor**: Tiptap (ProseMirror wrapper)
- **State Management**: Pinia
- **Storage**: LocalForage (IndexedDB)
- **Icons**: Lucide Vue

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at the provided URL.

## Usage

- **Create a page**: Click "New Page" in the sidebar.
- **Edit**: Click on the editor area and start typing.
- **Commands**: Type `/` (Slash) to see available commands (Note: UI for slash menu is minimal in MVP, currently supports Markdown shortcuts).
- **Formatting**: Select text to see the floating bubble menu for Bold, Italic, Strike, and Code.
- **Markdown Support**:
  - `#` + Space: Heading 1
  - `##` + Space: Heading 2
  - `*` or `-` + Space: Bullet List
  - `1.` + Space: Ordered List
  - `[]` + Space: Task List
  - `>` + Space: Blockquote
  - \`code\` : Inline code
  - \`\`\` + Enter: Code block

## License

MIT
