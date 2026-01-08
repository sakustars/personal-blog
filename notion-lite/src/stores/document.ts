import { defineStore } from 'pinia'
import localforage from 'localforage'
import { v4 as uuidv4 } from 'uuid'

export interface Document {
  id: string
  title: string
  content: string
  parentId: string | null
  createdAt: number
  updatedAt: number
}

const docStore = localforage.createInstance({
  name: 'notion-lite',
  storeName: 'documents'
})

export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [] as Document[],
    currentDocument: null as Document | null,
    loading: false
  }),

  actions: {
    async init() {
      this.loading = true
      try {
        const docs: Document[] = []
        await docStore.iterate((value: Document) => {
          docs.push(value)
        })
        this.documents = docs.sort((a, b) => b.updatedAt - a.updatedAt)
      } catch (err) {
        console.error('Failed to load documents', err)
      } finally {
        this.loading = false
      }
    },

    async createDocument(parentId: string | null = null) {
      const newDoc: Document = {
        id: uuidv4(),
        title: 'Untitled',
        content: '',
        parentId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      
      await docStore.setItem(newDoc.id, newDoc)
      this.documents.unshift(newDoc)
      this.currentDocument = newDoc
      return newDoc
    },

    async updateDocument(id: string, updates: Partial<Document>) {
      const index = this.documents.findIndex(d => d.id === id)
      if (index !== -1) {
        const updatedDoc = {
          ...this.documents[index],
          ...updates,
          updatedAt: Date.now()
        } as Document
        
        await docStore.setItem(id, updatedDoc)
        this.documents[index] = updatedDoc
        
        if (this.currentDocument?.id === id) {
          this.currentDocument = updatedDoc
        }
      }
    },

    async deleteDocument(id: string) {
      await docStore.removeItem(id)
      this.documents = this.documents.filter(d => d.id !== id)
      if (this.currentDocument?.id === id) {
        this.currentDocument = null
      }
    },

    async loadDocument(id: string) {
      const doc = await docStore.getItem<Document>(id)
      if (doc) {
        this.currentDocument = doc
      }
      return doc
    }
  }
})
