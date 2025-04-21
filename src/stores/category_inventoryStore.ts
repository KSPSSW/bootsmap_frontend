import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { ref } from 'vue'
import type { Category_Inventory } from 'src/models'

export const useCategoryInventoryStore = defineStore('categoryInventory', () => {
  const categories = ref<Category_Inventory[]>([])
  const filteredCategories = ref<Category_Inventory[]>([])
  const currentCategory = ref<Category_Inventory | null>(null)

  function setCurrentCategory(category: Category_Inventory | null) {
    currentCategory.value = category
  }

  // ดึงข้อมูลหมวดหมู่ทั้งหมด
  async function getCategories() {
    try {
      Loading.show({
        message: 'กำลังโหลดข้อมูลหมวดหมู่...',
      })

      const res = await api.get('/categories')
      categories.value = res.data
      // อัปเดตรายการหมวดหมู่ที่กรองแล้ว
      updateFilteredCategories('')

      return res.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้',
        color: 'negative',
        position: 'top',
      })

      return []
    } finally {
      Loading.hide()
    }
  }

  // ดึงข้อมูลหมวดหมู่ตาม ID
  async function getCategoryById(id: number) {
    try {
      Loading.show({
        message: 'กำลังโหลดข้อมูลหมวดหมู่...',
      })

      const res = await api.get(`/categories/${id}`)
      return res.data
    } catch (error) {
      console.error('Error fetching category:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้',
        color: 'negative',
        position: 'top',
      })
      return null
    } finally {
      Loading.hide()
    }
  }

  // เพิ่มหมวดหมู่ใหม่
  async function addCategory(category: Category_Inventory) {
    try {
      Loading.show({
        message: 'กำลังเพิ่มหมวดหมู่...',
      })

      delete category.id
      const res = await api.post('/categories', category)
      await getCategories()

      Notify.create({
        message: 'เพิ่มหมวดหมู่สำเร็จ',
        color: 'positive',
        position: 'top',
      })

      return res.data
    } catch (error) {
      console.error('Error adding category:', error)
      Notify.create({
        message: 'เพิ่มหมวดหมู่ไม่สำเร็จ',
        color: 'negative',
        position: 'top',
      })

      throw error
    } finally {
      Loading.hide()
    }
  }

  // อัปเดตข้อมูลหมวดหมู่
  async function updateCategory(category: Category_Inventory) {
    try {
      Loading.show({
        message: 'กำลังอัปเดตข้อมูลหมวดหมู่...',
      })

      const res = await api.patch(`/categories/${category.id}`, category)
      await getCategories()

      Notify.create({
        message: 'อัปเดตข้อมูลหมวดหมู่สำเร็จ',
        color: 'positive',
        position: 'top',
      })

      return res.data
    } catch (error) {
      console.error('Error updating category:', error)
      Notify.create({
        message: 'แก้ไขข้อมูลหมวดหมู่ไม่สำเร็จ',
        color: 'negative',
        position: 'top',
      })

      throw error
    } finally {
      Loading.hide()
    }
  }

  // ลบหมวดหมู่
  async function deleteCategory(category: Category_Inventory) {
    try {
      Loading.show({
        message: 'กำลังลบหมวดหมู่...',
      })

      await api.delete(`/categories/${category.id}`)
      await getCategories()

      Notify.create({
        message: 'ลบหมวดหมู่สำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      Notify.create({
        message: 'ลบหมวดหมู่ไม่สำเร็จ',
        color: 'negative',
        position: 'top',
      })

      throw error
    } finally {
      Loading.hide()
    }
  }

  // อัปเดตรายการหมวดหมู่ที่กรองแล้ว
  function updateFilteredCategories(query: string) {
    if (!query) {
      filteredCategories.value = [...categories.value]
      return
    }

    const isNumericQuery = !isNaN(Number(query))
    const queryLowerCase = query.toLowerCase()

    filteredCategories.value = categories.value.filter((category) => {
      if (isNumericQuery) {
        return category.id === Number(query)
      }

      return category.name.toLowerCase().includes(queryLowerCase)
    })
  }

  // เรียกข้อมูลหมวดหมู่เมื่อสร้าง store
  getCategories()

  return {
    categories,
    filteredCategories,
    currentCategory,
    getCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
    updateFilteredCategories,
    setCurrentCategory,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCategoryInventoryStore, import.meta.hot))
}
