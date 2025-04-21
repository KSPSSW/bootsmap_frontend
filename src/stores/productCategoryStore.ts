import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type ProductCategory } from 'src/models'
import { ref } from 'vue'

export const useProductCategoryStore = defineStore('productCategory', () => {
  const productCategories = ref<ProductCategory[]>([])

  // ดึงข้อมูลหมวดหมู่สินค้า
  async function getProductCategories() {
    try {
      Loading.show({ message: 'กำลังโหลดหมวดหมู่สินค้า...' })

      const res = await api.get('/product-categories')
      productCategories.value = res.data
    } catch (error) {
      console.error('Error fetching product categories:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดหมวดหมู่สินค้าได้',
        color: 'negative',
        position: 'top',
      })
    } finally {
      Loading.hide()
    }
  }

  // เพิ่มหมวดหมู่สินค้าใหม่
  async function addProductCategory(category: ProductCategory) {
    try {
      Loading.show()
      const res = await api.post('/product-categories', category)
      console.log(res.data)
      await getProductCategories()
      Notify.create({
        message: 'เพิ่มหมวดหมู่สำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error adding product category:', error)
      Notify.create({
        message: 'เพิ่มหมวดหมู่ล้มเหลว',
        color: 'negative',
        position: 'top',
      })
    } finally {
      Loading.hide()
    }
  }

  // อัปเดตหมวดหมู่สินค้า
  async function updateProductCategory(category: ProductCategory) {
    try {
      Loading.show({ message: 'กำลังอัปเดตหมวดหมู่สินค้า...' })

      const res = await api.patch(`/product-categories/${category.id}`, category)
      console.log(res.data)
      await getProductCategories()
      Notify.create({
        message: 'อัปเดตหมวดหมู่สำเร็จ',
        color: 'positive',
        position: 'top',
      })

      return res.data
    } catch (error) {
      console.error('Error updating product category:', error)
      Notify.create({
        message: 'อัปเดตหมวดหมู่ล้มเหลว',
        color: 'negative',
        position: 'top',
      })
      throw error
    } finally {
      Loading.hide()
    }
  }

  // ลบหมวดหมู่สินค้า
  async function deleteProductCategory(categoryId: number) {
    try {
      Loading.show({ message: 'กำลังลบหมวดหมู่สินค้า...' })

      const res = await api.delete(`/product-categories/${categoryId}`)
      console.log(res.data)
      await getProductCategories()
      Notify.create({
        message: 'ลบหมวดหมู่สำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error deleting product category:', error)
      Notify.create({
        message: 'ลบหมวดหมู่ล้มเหลว',
        color: 'negative',
        position: 'top',
      })
      throw error
    } finally {
      Loading.hide()
    }
  }

  // โหลดข้อมูลทันที
  getProductCategories()

  return {
    productCategories,
    getProductCategories,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductCategoryStore, import.meta.hot))
}
