<template>
  <div class="editor-wrapper w-full max-w-4xl mx-auto p-8 min-h-screen" v-if="editor">
    <div class="mb-4 flex flex-wrap items-center gap-1 border-b border-gray-200 dark:border-gray-800 pb-2 text-xs">
      <button
        class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 1 }) }"
        @click="setHeading(1)"
      >
        H1
      </button>
      <button
        class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 2 }) }"
        @click="setHeading(2)"
      >
        H2
      </button>
      <button
        class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bulletList') }"
        @click="toggleBulletList"
      >
        • List
      </button>
      <button
        class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('orderedList') }"
        @click="toggleOrderedList"
      >
        1. List
      </button>
      <button
        class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('taskList') }"
        @click="toggleTaskList"
      >
        [ ] Task
      </button>
      <button
        class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('blockquote') }"
        @click="toggleBlockquote"
      >
        “Quote”
      </button>
      <button
        class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('codeBlock') }"
        @click="toggleCodeBlock"
      >
        Code
      </button>
      <button
        class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="insertHorizontalRule"
      >
        —
      </button>
      <button
        class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('table') }"
        @click="insertTable"
      >
        Table
      </button>
      <button
        class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="addImage"
      >
        Image
      </button>
    </div>

    <bubble-menu
      class="bubble-menu flex bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      :tippy-options="{ duration: 100 }"
      :editor="editor"
    >
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'bg-gray-100 dark:bg-gray-700': editor.isActive('bold') }" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Bold class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'bg-gray-100 dark:bg-gray-700': editor.isActive('italic') }" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Italic class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'bg-gray-100 dark:bg-gray-700': editor.isActive('strike') }" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Strikethrough class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().toggleCode().run()" :class="{ 'bg-gray-100 dark:bg-gray-700': editor.isActive('code') }" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Code class="w-4 h-4" />
      </button>
    </bubble-menu>

    <div
      v-if="slashMenuState.active && filteredSlashItems.length"
      class="fixed z-50 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1 text-sm min-w-[220px]"
      :style="{
        top: (slashMenuState.coords?.y || 0) + 'px',
        left: (slashMenuState.coords?.x || 0) + 'px'
      }"
    >
      <button
        v-for="item in filteredSlashItems"
        :key="item.title"
        class="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="runSlashCommand(item)"
      >
        <div class="font-medium">
          {{ item.title }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ item.description }}
        </div>
      </button>
    </div>

    <editor-content :editor="editor" class="tiptap prose dark:prose-invert max-w-none focus:outline-none" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import ImageExtension from '@tiptap/extension-image'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import { Bold, Italic, Strikethrough, Code } from 'lucide-vue-next'

interface SlashRange {
  from: number
  to: number
}

interface SlashMenuState {
  active: boolean
  query: string
  range: SlashRange | null
  coords: { x: number; y: number } | null
}

interface SlashItem {
  title: string
  description: string
  command: (options: { editor: any; range: SlashRange }) => void
}

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  editable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const slashMenuState = ref<SlashMenuState>({
  active: false,
  query: '',
  range: null,
  coords: null,
})

const slashItems: SlashItem[] = [
  {
    title: 'Heading 1',
    description: '大标题',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
    },
  },
  {
    title: 'Heading 2',
    description: '中标题',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
    },
  },
  {
    title: 'Text',
    description: '普通文本',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
  {
    title: 'Bullet List',
    description: '项目符号列表',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: 'Numbered List',
    description: '有序列表',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: 'Todo List',
    description: '待办事项列表',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: 'Quote',
    description: '引用块',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
  },
  {
    title: 'Code Block',
    description: '多行代码块',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
  },
  {
    title: 'Divider',
    description: '分割线',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    title: 'Table',
    description: '插入基础表格',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run()
    },
  },
  {
    title: 'Image',
    description: '插入图片（通过 URL）',
    command: ({ editor, range }) => {
      const url = window.prompt('Image URL')
      if (!url) return
      editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
    },
  },
]

const filteredSlashItems = computed(() => {
  const q = slashMenuState.value.query.trim().toLowerCase()
  if (!q) return slashItems
  return slashItems.filter((item) => item.title.toLowerCase().includes(q))
})

const resetSlashMenu = () => {
  slashMenuState.value = {
    active: false,
    query: '',
    range: null,
    coords: null,
  }
}

const updateSlashMenu = (editorInstance: any) => {
  const { state } = editorInstance
  const { selection } = state

  if (!selection.empty) {
    resetSlashMenu()
    return
  }

  const $from = (selection as any).$from
  const textFromBlockStart = $from.parent.textBetween(0, $from.parentOffset, '\n', '\n')
  const match = textFromBlockStart.match(/\/([^\s/]*)$/)

  if (!match) {
    resetSlashMenu()
    return
  }

  const fullMatch = match[0]
  const query = match[1] ?? ''
  const from = $from.pos - fullMatch.length
  const to = $from.pos
  const coords = editorInstance.view.coordsAtPos(from)

  slashMenuState.value = {
    active: true,
    query,
    range: { from, to },
    coords: { x: coords.left, y: coords.bottom + 4 },
  }
}

const editor = useEditor({
  content: props.modelValue,
  editable: props.editable,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Placeholder.configure({
      placeholder: 'Type \'/\' for commands...',
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    ImageExtension,
    BubbleMenuExtension,
  ],
  editorProps: {
    attributes: {
      class: 'focus:outline-none min-h-[500px]',
    },
    handleKeyDown: (_view: unknown, event: KeyboardEvent) => {
      if (event.key === 'Escape' && slashMenuState.value.active) {
        resetSlashMenu()
        return true
      }

      if (event.key === 'Enter' && slashMenuState.value.active) {
        const first = filteredSlashItems.value[0]
        if (first) {
          runSlashCommand(first)
          return true
        }
      }

      return false
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
    updateSlashMenu(editor)
  },
})

const runSlashCommand = (item: SlashItem) => {
  if (!editor?.value || !slashMenuState.value.range) return
  item.command({
    editor: editor.value,
    range: slashMenuState.value.range,
  })
  resetSlashMenu()
}

const setHeading = (level: 1 | 2 | 3) => {
  if (!editor?.value) return
  editor.value.chain().focus().toggleHeading({ level }).run()
}

const toggleBulletList = () => {
  if (!editor?.value) return
  editor.value.chain().focus().toggleBulletList().run()
}

const toggleOrderedList = () => {
  if (!editor?.value) return
  editor.value.chain().focus().toggleOrderedList().run()
}

const toggleTaskList = () => {
  if (!editor?.value) return
  editor.value.chain().focus().toggleTaskList().run()
}

const toggleBlockquote = () => {
  if (!editor?.value) return
  editor.value.chain().focus().toggleBlockquote().run()
}

const toggleCodeBlock = () => {
  if (!editor?.value) return
  editor.value.chain().focus().toggleCodeBlock().run()
}

const insertHorizontalRule = () => {
  if (!editor?.value) return
  editor.value.chain().focus().setHorizontalRule().run()
}

const insertTable = () => {
  if (!editor?.value) return
  editor.value
    .chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run()
}

const addImage = () => {
  if (!editor?.value) return
  const url = window.prompt('Image URL')
  if (!url) return
  editor.value.chain().focus().setImage({ src: url }).run()
}
</script>

<style>
.tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
