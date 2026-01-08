<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <div class="w-full max-w-sm bg-white dark:bg-gray-950 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
      <h1 class="text-xl font-semibold mb-1">Sign in</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
        登录后才能访问你的工作区，数据仅保存在本地浏览器。
      </p>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm mb-1" for="name">名称</label>
          <input
            id="name"
            v-model="name"
            type="text"
            autocomplete="name"
            class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入你的名称"
          />
        </div>

        <button
          type="submit"
          class="w-full mt-2 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!name.trim()"
        >
          登录
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const name = ref('')

const onSubmit = () => {
  const trimmed = name.value.trim()
  if (!trimmed) return
  auth.login(trimmed)
  const redirect = route.query.redirect as string | undefined
  if (redirect) {
    router.replace(redirect)
  } else {
    router.replace({ name: 'Home' })
  }
}
</script>

