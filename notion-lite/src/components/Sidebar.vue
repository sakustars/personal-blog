<template>
  <aside class="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
    <div class="p-4 flex items-center justify-between">
      <div class="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
        <User class="w-5 h-5" />
        <span>{{ userName }}</span>
      </div>
      <button
        class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        @click="handleLogout"
      >
        退出
      </button>
    </div>

    <div class="px-3 py-2">
      <button 
        @click="createDoc"
        class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
      >
        <Plus class="w-4 h-4" />
        New Page
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-2 py-2">
      <div class="space-y-0.5">
        <div 
          v-for="doc in documents" 
          :key="doc.id"
          @click="selectDoc(doc.id)"
          class="group flex items-center justify-between px-3 py-1.5 text-sm rounded cursor-pointer select-none transition-colors"
          :class="currentDocId === doc.id ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
        >
          <div class="flex items-center gap-2 truncate">
            <FileText class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ doc.title || 'Untitled' }}</span>
          </div>
          <button 
            @click.stop="deleteDoc(doc.id)"
            class="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-300 dark:hover:bg-gray-700 rounded"
          >
            <Trash2 class="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentStore } from '../stores/document'
import { useAuthStore } from '../stores/auth'
import { Plus, FileText, Trash2, User } from 'lucide-vue-next'

const store = useDocumentStore()
const auth = useAuthStore()
const router = useRouter()

const documents = computed(() => store.documents)
const currentDocId = computed(() => store.currentDocument?.id)
const userName = computed(() => auth.user?.name || 'My Workspace')

const createDoc = async () => {
  await store.createDocument()
}

const selectDoc = async (id: string) => {
  await store.loadDocument(id)
}

const deleteDoc = async (id: string) => {
  if (confirm('Are you sure you want to delete this page?')) {
    await store.deleteDocument(id)
  }
}

const handleLogout = () => {
  auth.logout()
  router.push({ name: 'Login' })
}
</script>
