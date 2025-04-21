import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type ProductSize } from 'src/models'
import { ref } from 'vue'

export const useProductSizeStore = defineStore('productSize', () => {
  const productSizes = ref<ProductSize[]>([])

  // ดึงข้อมูลขนาดสินค้า
  async function getProductSizes() {
    try {
      Loading.show({ message: 'กำลังโหลดขนาดสินค้า...' })

      const res = await api.get('/productsize')
      productSizes.value = res.data
    } catch (error) {
      console.error('Error fetching product sizes:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดขนาดสินค้าได้',
        color: 'negative',
        position: 'top',
      })
    } finally {
      Loading.hide()
    }
  }

  // เพิ่มขนาดสินค้า
  async function addProductSize(size: ProductSize) {
    try {
      Loading.show()
      const res = await api.post('/productsize', size)
      console.log(res.data)
      await getProductSizes()
      Notify.create({
        message: 'เพิ่มขนาดสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error adding product size:', error)
      Notify.create({
        message: 'เพิ่มขนาดสินค้าล้มเหลว',
        color: 'negative',
        position: 'top',
      })
    } finally {
      Loading.hide()
    }
  }

  // อัปเดตขนาดสินค้า
  async function updateProductSize(size: ProductSize) {
    try {
      Loading.show({ message: 'กำลังอัปเดตขนาดสินค้า...' })

      const res = await api.patch(`/productsize/${size.id}`, size)
      console.log(res.data)
      await getProductSizes()
      Notify.create({
        message: 'อัปเดตขนาดสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })

      return res.data
    } catch (error) {
      console.error('Error updating product size:', error)
      Notify.create({
        message: 'อัปเดตขนาดสินค้าล้มเหลว',
        color: 'negative',
        position: 'top',
      })
      throw error
    } finally {
      Loading.hide()
    }
  }

  // ลบขนาดสินค้า
  async function deleteProductSize(sizeId: number) {
    try {
      Loading.show({ message: 'กำลังลบขนาดสินค้า...' })

      const res = await api.delete(`/productsize/${sizeId}`)
      console.log(res.data)
      await getProductSizes()
      Notify.create({
        message: 'ลบขนาดสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error deleting product size:', error)
      Notify.create({
        message: 'ลบขนาดสินค้าล้มเหลว',
        color: 'negative',
        position: 'top',
      })
      throw error
    } finally {
      Loading.hide()
    }
  }

  // โหลดข้อมูลทันทีเมื่อ store ถูกสร้าง
  getProductSizes()

  return {
    productSizes,
    getProductSizes,
    addProductSize,
    updateProductSize,
    deleteProductSize,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductSizeStore, import.meta.hot))
}
