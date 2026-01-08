I have analyzed your request to build a full-featured Notion-like application. Since the current directory contains a static blog (`VitePress`), I recommend creating a dedicated sub-project (e.g., `notion-lite`) to implement this dynamic application properly without interfering with your existing blog.

Here is the implementation plan for the **MVP (Minimum Viable Product)**:

### **Phase 1: Project Initialization & Tech Stack Setup**
- **Create Project**: Initialize a new Vite project (`notion-lite`) with **Vue 3** and **TypeScript**.
- **UI Framework**: Install **Tailwind CSS** for modern, responsive styling.
- **State Management**: Set up **Pinia** for document state management.
- **Routing**: Configure **Vue Router** for document navigation.

### **Phase 2: Core Block Editor (The "Notion" Part)**
- **Editor Engine**: Integrate **Tiptap** (a headless wrapper for ProseMirror) which is the industry standard for Notion-like block editors.
- **Block Features**: Implement support for:
  - Rich text (Bold, Italic, Strike, etc.)
  - Headings (H1-H3)
  - Lists (Bullet, Ordered, Task lists)
  - Code blocks with syntax highlighting
- **Interactive UI**:
  - Implement a **Floating Menu** (text selection actions).
  - Implement basic **Slash Commands** (type `/` to insert blocks).

### **Phase 3: Document Management & UI**
- **Layout**: Create a standard 3-column layout (Sidebar, Editor, Metadata/Settings).
- **Sidebar**: Implement a recursive file tree structure for organizing documents.
- **Theming**: Implement Dark/Light mode toggle using Tailwind's dark mode.

### **Phase 4: Data Persistence (Offline First)**
- **Local Storage**: Use **IndexedDB** (via `localforage` or `idb`) to save documents locally, fulfilling the "Offline Edit" requirement.
- **Auto-save**: Implement a mechanism to auto-save changes to the local store.
- **Backend Prep**: Structure the data model to be compatible with a future Backend/WebSocket sync.

### **Why this approach?**
- **Vue 3 + Tiptap**: Best-in-class performance for block editors and matches your existing stack preference.
- **Local-First**: Ensures speed and offline capability immediately (Requirement 4 & 5).
- **Separation**: Keeps your blog clean while building the complex app in `notion-lite`.

Shall I proceed with initializing the `notion-lite` project?