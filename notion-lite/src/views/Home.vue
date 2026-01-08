<template>
  <div class="flex h-screen overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <Sidebar />
    
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-12 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0">
        <div class="flex items-center gap-2 text-sm text-gray-500">
           <span v-if="store.loading">Loading...</span>
           <span v-else-if="store.currentDocument">Last edited {{ new Date(store.currentDocument.updatedAt).toLocaleTimeString() }}</span>
        </div>
        <button @click="toggleTheme" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {{ isDark ? '🌞' : '🌙' }}
        </button>
      </header>

      <main class="flex-1 overflow-y-auto relative" v-if="store.currentDocument">
        <div class="max-w-4xl mx-auto px-8 pt-12 pb-24">
           <input 
             v-model="title"
             @input="updateTitle"
             placeholder="Untitled"
             class="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-700 mb-4 px-0 outline-none"
           />
           
           <!-- Key ensures editor re-renders when doc changes -->
           <Editor 
             :key="store.currentDocument.id"
             :modelValue="content" 
             @update:modelValue="updateContent" 
           />
        </div>
      </main>
      
      <div v-else class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <p class="mb-4">Select a page or create a new one</p>
          <button @click="store.createDocument()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors">
            Create New Page
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useDocumentStore } from '../stores/document'
import Sidebar from '../components/Sidebar.vue'
import Editor from '../components/Editor.vue'

const store = useDocumentStore()
const isDark = ref(false)
const title = ref('')
const content = ref('')

// Sync local state with store
watch(() => store.currentDocument, (newDoc) => {
  if (newDoc) {
    title.value = newDoc.title
    content.value = newDoc.content
  }
}, { immediate: true })

const updateTitle = () => {
  if (store.currentDocument) {
    store.updateDocument(store.currentDocument.id, { title: title.value })
  }
}

const updateContent = (newContent: string) => {
  if (store.currentDocument) {
    store.updateDocument(store.currentDocument.id, { content: newContent })
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

onMounted(async () => {
  // Initialize theme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }

  // Initialize store
  await store.init()
  if (store.documents.length === 0) {
    await store.createDocument()
  } else if (!store.currentDocument) {
    const firstDoc = store.documents[0]
    if (firstDoc) {
      await store.loadDocument(firstDoc.id)
    }
  }
})
</script>
